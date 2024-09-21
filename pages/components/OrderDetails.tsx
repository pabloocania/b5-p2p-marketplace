import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clipboard } from "lucide-react";
import { Order, OrderType } from "ba-api-client";

export default function OrderDetails({ order }: { order: Order | undefined }) {
  const [walletAddress, setWalletAddress] = useState("");
  const [clipboardSupported, setClipboardSupported] = useState(false);

  useEffect(() => {
    setClipboardSupported("clipboard" in navigator);
  }, []);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWalletAddress(text);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

  if (!order) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent>
          <p className="text-center py-4">No order details available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-2xl font-bold">
          {order.amount} {order.tokenCode ?? ""}
        </CardTitle>
        <Badge
          variant={order.type === "BUY" ? "default" : "destructive"}
          className="text-sm"
        >
          {order.type}
        </Badge>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-1">
          <div>
            <span className="text-sm font-semibold block">
              Equivalent in ARS: ${order.fiatAmount}
            </span>
          </div>
          <div>
            <span className="text-sm font-semibold block">
              Status: {order.status}
            </span>
          </div>
          <div>
            <span className="text-sm font-semibold block">
              Payment Method:{" "}
              {order.paymentMethod?.map((method) => method.type).join(", ")}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">
              User: {order.creatorId}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">
              Order ID: {order.id}
            </span>
          </div>
          {order.type === ("SELL" as OrderType) && (
            <div className="space-y-2">
              {/* <label htmlFor="walletAddress" className="font-semibold block">
              Wallet Address
            </label> */}
              <div className="flex space-x-2">
                <Input
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter wallet address"
                  className="flex-grow"
                />
                {clipboardSupported && (
                  <Button
                    onClick={handlePasteClipboard}
                    variant="outline"
                    size="icon"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Take order</Button>
      </CardFooter>
      {/* {isButtonVisible && (
        <CardFooter className="pt-0">
          <Button className="w-full">Select</Button>
        </CardFooter>
      )} */}
    </Card>
  );

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>
            {order.amount} {order.tokenCode}
          </span>
          <Badge variant={order.type === "buy" ? "default" : "destructive"}>
            {order.type.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <span className="font-semibold">Equivalent in ARS:</span> $
          {order.fiatAmount}
        </div>
        <div>
          <span className="font-semibold">Status:</span> {order.status}
        </div>
        <div>
          <span className="font-semibold">Payment Method:</span>{" "}
          {order.paymentMethod}
        </div>
        <div>
          <span className="font-semibold">User ID:</span> {order.creatorId}
        </div>
        <div>
          <span className="font-semibold">Order ID:</span> {order.id}
        </div>
        {order.type === OrderType && (
          <div className="space-y-2">
            <label htmlFor="walletAddress" className="font-semibold block">
              Wallet Address
            </label>
            <div className="flex space-x-2">
              <Input
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter wallet address"
                className="flex-grow"
              />
              {clipboardSupported && (
                <Button
                  onClick={handlePasteClipboard}
                  variant="outline"
                  size="icon"
                  title="Paste from clipboard"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full">Confirm Order</Button>
      </CardFooter>
    </Card>
  );
}
