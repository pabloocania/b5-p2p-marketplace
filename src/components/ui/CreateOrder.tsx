"use client";
import { Rocket } from "lucide-react";
import PaymentMethodsDemo from "./ComponentSelectorDemo";
import { useState } from "react";
import {
  CreateOrderRequest,
  OrderType,
  Order,
  generateSecretAndHash,
} from "b5-api-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { p2pMarketAPIClient as client } from "../../lib/APIClients";
import { useUserContext } from "./UserContext";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useTranslation } from "react-i18next";
import TokenSelector from "@/lib/web3/TokenSelector";
import { ScrollableContainer } from "./ScrollabelContainer";

interface CreateOrderProps {
  onClose: () => void;
  onConnectWallet: () => void; // Add this prop
}

const tokens = [
  { symbol: "PDOC", name: "PDOC" },
  { symbol: "USDK", name: "USDK" },
];

export default function CreateOrder({
  onClose,
  onConnectWallet,
}: CreateOrderProps) {
  const [orderType, setOrderType] = useState<OrderType>("SELL");
  const [description, setDescription] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [tokenCode, setTokenCode] = useState<string>("PDOC");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const { user, isLoggedIn } = useUserContext();
  const { openConnectModal } = useConnectModal();
  const { t } = useTranslation();
  const [blockchain, setBlockchain] = useState<string>("");
  const [selectedMethods, setSelectedMethods] = useState([]);

  const calculateARSEquivalent = () => {
    return tokenAmount * 1000;
  };

  const handleOrderTypeChange = (value: string) => {
    setOrderType(value as OrderType);
  };

  const handleConnectButton = () => {
    if (openConnectModal) {
      openConnectModal();
    }
    onConnectWallet();
  };

  const handleBlockchainChange = (blockchain: string) => {
    setBlockchain(blockchain);
  };

  const handleTokenChange = (tokenCode: string) => {
    setTokenCode(tokenCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Métodos de pago seleccionados:", selectedMethods);

    const { secret: secretSeller } = generateSecretAndHash();
    const { secret: secretBuyer } = generateSecretAndHash();

    const newOrder: CreateOrderRequest = {
      type: orderType,
      description,
      amount: tokenAmount.toString(),
      tokenCode,
      fiatAmount: calculateARSEquivalent().toString(),
      fiatCode: "ARS",
      walletAddress: orderType === "BUY" ? walletAddress : undefined,
      paymentMethods: selectedMethods.map((method) => ({
        type: method.type,
        alias: method.alias || username,
        cbu: method.cbu || "",
        entity: method.entity || "",
        fullName: method.fullName || "",
      })),
      creatorId: user?.userId,
      status: "PENDING",
      creatorUsername: user?.username,
      sellerHash: secretSeller.toString("hex"),
      buyerHash: secretBuyer.toString("hex"),
    };

    console.log("Orden a enviar:", newOrder);

    try {
      const ordersResponse = await client.createOrder(newOrder, {
        "Content-Type": "application/json",
        "x-blockchain": blockchain,
      });

      console.log("Respuesta de la API:", ordersResponse);

      if (ordersResponse.orders.length === 1) {
        setCreatedOrder(ordersResponse.orders[0]);
        onClose();
      }
    } catch (err) {
      console.error("Failed to create order:", err);
      alert("Failed to create order: " + err);
    }
  };

  const isFormComplete = () => {
    return (
      tokenAmount > 0 &&
      blockchain !== "" &&
      tokenCode !== "" &&
      (orderType === "SELL" || walletAddress) &&
      username
    );
  };

  return (
    <ScrollableContainer>
      <div className="flex justify-center items-center pt-8">
        <Card className="w-full max-w-md border border-primary border-opacity-20">
          <CardHeader className="flex justify-center items-center">
            <CardTitle className="text-center text-terciary py-3">
              {t("create_order")}
            </CardTitle>
          </CardHeader>
          <Separator className="my-2"></Separator>
          <CardContent className="text-primary">
            {!isLoggedIn ? (
              <Button
                className="p-4 text-center w-full text-white"
                onClick={handleConnectButton}
              >
                {t("connect_to_continue")}
              </Button>
            ) : createdOrder ? null : (
              <form>
                <div className="space-y-3 py-3">
                  <div className="flex flex-row items-center">
                    <Label className="font-bold text-lg text-terciary px-3">
                      {t("i_want_to")}
                    </Label>
                    <Rocket size={20} className="text-terciary text-sm" />
                  </div>
                  <div className="px-3">
                    <RadioGroup
                      id="order_type"
                      value={orderType}
                      onValueChange={handleOrderTypeChange}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="sell" value="SELL" />
                        <Label htmlFor="sell">{t("sell")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="buy" value="BUY" />
                        <Label htmlFor="buy">{t("buy")}</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* <BlockchainSelector
                    onBlockchainChange={handleBlockchainChange}
                    onCoinChange={handleCoinChange}
                  /> */}
                    <TokenSelector
                      onBlockchainChange={handleBlockchainChange}
                      onTokenChange={handleTokenChange}
                    />
                  </div>
                  {blockchain !== "" && tokenCode !== "" && (
                    <div className="flex items-center space-x-2">
                      <Input
                        id="token-amount"
                        type="number"
                        placeholder={t("enter_amount")}
                        value={tokenAmount === 0 ? "" : tokenAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTokenAmount(
                            value === "" ? 0 : parseFloat(value) || 0
                          );
                        }}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-end space-x-2">
                    <Label className="text-xs font-semibold">
                      {t("en_ars")}:{" "}
                    </Label>
                    <div className="text-xs font-semibold">
                      {calculateARSEquivalent().toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })}
                    </div>
                  </div>

                  {orderType === "SELL" && (
                    <PaymentMethodsDemo
                      selectedMethods={selectedMethods}
                      setSelectedMethods={setSelectedMethods}
                    />
                  )}

                  {orderType === "BUY" && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 p-4">
                        <RadioGroup
                          defaultValue="mercado-pago"
                          className="flex items-center space-x-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              id="mercado-pago"
                              value="mercado-pago"
                            />
                            <Label htmlFor="mercado-pago">Mercado Pago</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem id="bank" value="bank" disabled />
                            <Label htmlFor="bank" className="text-gray-400">
                              {t("bank")}
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <Input
                        id="mercado-pago-username"
                        placeholder="@alias"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-[90%] m-5"
                      />
                      <Label className="font-bold p-4" htmlFor="wallet-address">
                        {t("address")}
                      </Label>
                      <Input
                        id="wallet-address"
                        placeholder={t("insert_wallet_address")}
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="w-[90%] m-5"
                      />
                    </div>
                  )}
                </div>
              </form>
            )}
          </CardContent>
          {!createdOrder && (
            <CardFooter className="py-2">
              <Button
                className="w-full text-white bg-secondary"
                onClick={handleSubmit}
                disabled={!isFormComplete()} // Disable button if form is incomplete
              >
                {t("create_order")}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </ScrollableContainer>
  );
}
