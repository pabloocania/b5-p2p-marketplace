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

interface CreateOrderProps {
  onClose: () => void;
  onConnectWallet: () => void; // Add this prop
}

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
  const { user } = useUserContext();
  const { balances } = useEtherspotSdk();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

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

    // Check balance for SELL order
    if (orderType === "SELL") {
      const tokenBalance = balances.find(
        (balance) => balance.name === tokenCode
      );

      if (
        !tokenBalance ||
        parseFloat(tokenBalance.smartWalletBalance) < tokenAmount
      ) {
        alert("Not enough balance");
        return;
      }
    }
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
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="justify-between items-center">
            {createdOrder ? "Order Created" : "Create Order"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-5" />
          {!isConnected ? (
            <Button
              className="p-4 text-center w-full"
              onClick={handleConnectButton} // Use the handler
            >
              Connect your wallet to proceed
            </Button>
          ) : createdOrder ? (
            <OrderCard orderDTO={createdOrder} showSelectButton={false} />
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex items-center space-x-2">
                <RadioGroup
                  value={orderType}
                  onValueChange={handleOrderTypeChange}
                  className="flex items-center space-x-2"
                >
                  <div className="flex-1 flex items-center space-x-2">
                    <RadioGroupItem id="buy" value="BUY" />
                    <Label htmlFor="buy">Buy</Label>
                  </div>
                  <div className="flex-1 flex items-center space-x-2">
                    <RadioGroupItem id="sell" value="SELL" />
                    <Label htmlFor="sell">Sell</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="token-amount">Token Amount</Label>
                    <Input
                      id="token-amount"
                      type="number"
                      placeholder="Enter token amount"
                      value={tokenAmount}
                      onChange={(e) =>
                        setTokenAmount(parseFloat(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="token-code">Token Code</Label>
                    <Input
                      id="token-code"
                      value={tokenCode}
                      onChange={(e) => setTokenCode(e.target.value)}
                      placeholder="Enter token code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ARS Equivalent</Label>
                  <div className="text-lg font-semibold">
                    {calculateARSEquivalent().toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    })}
                  </div>
                </div>
                {orderType === "BUY" && (
                  <div className="space-y-2">
                    <Label htmlFor="wallet-address">Wallet Address</Label>
                    <Input
                      id="wallet-address"
                      placeholder="Enter your wallet address"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
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
                          Bank
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="mercado-pago-username"
                      placeholder="@alias"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div> */}
              </div>
            </form>
          )}
        </CardContent>
        {!createdOrder && isConnected && (
          <CardFooter>
            <Button className="w-full" onClick={handleSubmit}>
              Create Order
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
