"use client";

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
import { OrderCard } from "./OrderCard";
import { p2pMarketAPIClient as client } from "../../lib/APIClients";
import { useUserContext } from "./UserContext";
import { useEtherspotSdk } from "../../lib/web3/EtherspotSdkProvider";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateOrderProps {
  onClose: () => void;
  onConnectWallet: () => void; // Add this prop
}

const tokens = [{ symbol: "PDOC", name: "PDOC" }];

export default function CreateOrder({
  onClose,
  onConnectWallet,
}: CreateOrderProps) {
  const [orderType, setOrderType] = useState<OrderType>("BUY");
  const [description, setDescription] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [tokenCode, setTokenCode] = useState<string>("PDOC");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const { user, isLoggedIn } = useUserContext();
  const { balances } = useEtherspotSdk();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { t } = useTranslation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      paymentMethods: [
        {
          type: "FINTECH",
          alias: username,
          cbu: "",
          entity: "",
          fullName: "",
        },
      ],
      creatorId: user?.userId,
      status: "PENDING",
      creatorUsername: user?.username,
      sellerHash: secretSeller.toString("hex"),
      buyerHash: secretBuyer.toString("hex"),
    };

    try {
      const ordersResponse = await client.createOrder(newOrder);
      if (ordersResponse.orders.length === 1) {
        setCreatedOrder(ordersResponse.orders[0]);
        onClose();
      }
    } catch (err) {
      console.error("Failed to create order:", err);
      alert("Failed to create order: " + err);
    }
  };

  return (
    <div className="flex justify-center items-center pt-2">
      <Card className="w-full max-w-md">
        <CardHeader className="flex justify-center items-center">
          <CardTitle className="text-center text-primary">
            {t("create_order")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isLoggedIn ? (
            <Button
              className="p-4 text-center w-full text-white"
              onClick={handleConnectButton} // Use the handler
            >
              {t("connect_to_continue")}
            </Button>
          ) : createdOrder ? (
            <OrderCard orderDTO={createdOrder} showSelectButton={false} />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-2">
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
                  <Select onValueChange={setTokenCode} required>
                    <SelectTrigger id="token">
                      <SelectValue placeholder={t("select_token")} />
                    </SelectTrigger>
                    <SelectContent>
                      {tokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          {token.name} ({token.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    id="token-amount"
                    type="number"
                    placeholder={t("enter_amount")}
                    value={tokenAmount === 0 ? "" : tokenAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTokenAmount(value === "" ? 0 : parseFloat(value) || 0);
                    }}
                  />
                </div>
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
                <div className="space-y-2">
                  <Label className="font-bold">{t("payment_method")}</Label>
                  <div className="flex items-center space-x-2">
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
                  />
                </div>
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
          <CardFooter>
            <Button
              className="w-full text-white bg-secondary"
              onClick={handleSubmit}
            >
              {t("create_order")}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
