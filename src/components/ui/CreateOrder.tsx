"use client";
import { useEffect, useState } from "react";
import {
  CreateOrderRequest,
  OrderType,
  Order,
  generateSecretAndHash,
  PaymentMethod,
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
import { ExchangeRatesService } from "@/lib/web3/ExchangeRates";
import { ScrollableContainer } from "./ScrollabelContainer";
import CompactPaymentMethodSelector from "./CompactPaymentMethodSelector";

interface CreateOrderProps {
  onClose: () => void;
  onConnectWallet: () => void; // Add this prop
}

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
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const [suggestedRate, setSuggestedRate] = useState<number>(1000);
  const [customRate, setCustomRate] = useState<number>(1000);
  const [fiatCode, setFiatCode] = useState<"ARS" | "EUR">("ARS");

  useEffect(() => {
    const fetchSuggestedRate = async () => {
      try {
        const rates = await ExchangeRatesService.fetchPricesWithRetry();
        const rate =
          tokenCode === "USDC"
            ? fiatCode === "ARS"
              ? rates.ars
              : rates.eur
            : 1000; // fallback para otros tokens
        setSuggestedRate(rate);
        setCustomRate(rate);
      } catch (error) {
        console.error("Error fetching suggested rate:", error);
      }
    };

    fetchSuggestedRate();
  }, [tokenCode, fiatCode]);

  const calculateFiatEquivalent = () => {
    if (customRate === 0 || tokenAmount === 0) return 0;
    return Math.round(tokenAmount * customRate * 100) / 100; // Redondear a 2 decimales
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

  const handleFiatCodeChange = (value: "ARS" | "EUR") => {
    setFiatCode(value);
  };

  const handleToggle = (method: PaymentMethod) => {
    setSelectedMethods((prev) =>
      prev.some((m) => m.entity === method.entity)
        ? prev.filter((m) => m.entity !== method.entity)
        : [...prev, method]
    );
  };

  const handleUpdateMethod = (updatedMethod: PaymentMethod) => {
    // Create a new immutable array with the updated method
    const updatedSelectedMethods = selectedMethods.map((method) =>
      method.entity === updatedMethod.entity ? { ...updatedMethod } : method
    );

    setSelectedMethods(updatedSelectedMethods);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { secret: secretSeller } = generateSecretAndHash();
    const { secret: secretBuyer } = generateSecretAndHash();

    const newOrder: CreateOrderRequest = {
      type: orderType,
      description,
      amount: tokenAmount.toString(),
      tokenCode,
      fiatAmount: calculateFiatEquivalent().toString(),
      fiatCode: fiatCode,
      walletAddress: orderType === "BUY" ? walletAddress : undefined,
      paymentMethods: selectedMethods,
      creatorId: user?.userId,
      status: "PENDING",
      creatorUsername: user?.username,
      sellerHash: secretSeller.toString("hex"),
      buyerHash: secretBuyer.toString("hex"),
    };

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
      selectedMethods.length > 0 &&
      tokenAmount > 0 &&
      blockchain !== "" &&
      tokenCode !== "" &&
      customRate > 0 &&
      (orderType === "SELL" || walletAddress)
    );
  };

  return (
    <ScrollableContainer>
      <div className="flex justify-center items-center pt-8">
        <Card className="w-full max-w-md border border-primary border-opacity-20">
          <CardHeader className="flex justify-center items-center">
            <CardTitle className="text-center text-primary">
              {t("create_order")}
            </CardTitle>
          </CardHeader>
          <Separator className="my-2"></Separator>
          <CardContent className="text-primary">
            {!isLoggedIn ? (
              <Button
                className="p-4 text-center w-full text-white"
                onClick={handleConnectButton} // Use the handler
              >
                {t("connect_to_continue")}
              </Button>
            ) : createdOrder ? null : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <Label className="font-bold">{t("i_want_to")}</Label>
                  <div>
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
                    <>
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

                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">
                            Quiero recibir en:
                          </Label>
                          <RadioGroup
                            value={fiatCode}
                            onValueChange={handleFiatCodeChange}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem id="ars" value="ARS" />
                              <Label htmlFor="ars">ARS</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem id="eur" value="EUR" />
                              <Label htmlFor="eur">EUR</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="bg-secondary bg-opacity-10 p-2 rounded-md">
                          <Label className="text-xs font-semibold">
                            {t("suggested_rate")}
                          </Label>
                          <div className="text-sm font-medium">
                            1 {tokenCode} = {fiatCode === "EUR" ? "€" : "$"}{" "}
                            {suggestedRate.toLocaleString("es-AR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <Label
                            htmlFor="custom-rate"
                            className="text-xs font-semibold"
                          >
                            {t("your_rate")}
                          </Label>
                          <Input
                            id="custom-rate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={customRate || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                setCustomRate(0);
                                return;
                              }

                              const numValue = parseFloat(value);
                              if (!isNaN(numValue) && numValue >= 0) {
                                const roundedValue =
                                  Math.round(numValue * 100) / 100;
                                setCustomRate(roundedValue);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "e" || e.key === "-") {
                                e.preventDefault();
                              }
                            }}
                            className={`mt-1 ${
                              customRate === 0 ? "border-red-500" : ""
                            }`}
                            placeholder="Ingresa el tipo de cambio"
                          />
                          {customRate === 0 && (
                            <span className="text-xs text-red-500 mt-1">
                              El tipo de cambio debe ser mayor a 0
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-end space-x-2">
                    <Label className="text-xs font-semibold">
                      {t("en")} {fiatCode === "EUR" ? "€" : "$"}:
                    </Label>
                    <div className="text-xs font-semibold">
                      {calculateFiatEquivalent().toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <CompactPaymentMethodSelector
                    selectedMethods={selectedMethods}
                    onToggle={handleToggle}
                    onUpdateMethod={handleUpdateMethod}
                  />
                  {orderType === "BUY" && (
                    <div>
                      <Label className="font-bold" htmlFor="wallet-address">
                        {t("address")}
                      </Label>
                      <Input
                        id="wallet-address"
                        placeholder={t("insert_wallet_address")}
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </form>
            )}
          </CardContent>
          {!createdOrder && (
            <CardFooter className="py-2 mx-4">
              <Button
                className="w-full text-white bg-secondary"
                onClick={handleSubmit}
                disabled={!isFormComplete()}
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
