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
import { Order, OrderType } from "b5-api-client";
import { useTranslation } from "react-i18next";

export default function OrderDetails({ order }: { order: Order | undefined }) {
  const [walletAddress, setWalletAddress] = useState("");
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const { t } = useTranslation();

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
          <p className="text-center py-4 font-secondary">
            {t("no_order_details")}
          </p>
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
            <span className="text-sm font-secondary block">
              {t("in_exchange_of")}: ${order.fiatAmount}
            </span>
          </div>
          <div>
            <span className="text-sm font-secondary block">
              {t("in_exchange_of")}: {order.status}
            </span>
          </div>
          <div>
            <span className="text-sm font-secondary block">
              {t("payment_method")}:{" "}
              {order.paymentMethods?.map((method) => method.type).join(", ")}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-secondary">
              {t("user")}: {order.creatorId}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-secondary">
              {t("order_id")}: {order.id}
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
                  placeholder={t("insert_wallet_address")}
                  className="flex-grow font-secondary [&::placeholder]:font-secondary"
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
        <Button className="w-full">{t("take_order")}</Button>
      </CardFooter>
    </Card>
  );
}
