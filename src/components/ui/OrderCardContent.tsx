// OrderCardContent.tsx
import React, { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Order, OrderStatus, OrderType, PaymentMethod } from "b5-api-client";
import PaymentMethodDisplay from "./PaymentMethodDisplay";
import { Rating } from "./Rating";
import { Button } from "./button";
import { Input } from "./input";
import { Clipboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserProps } from "@/lib/useUser";

interface OrderCardContentProps {
  order: Order;
  user: UserProps | undefined;
  showDetails: boolean;
  walletAddress: string;
  setWalletAddress: (value: string) => void;
}

const finishedStatusesList: OrderStatus[] = [
  "RELEASED",
  "CLOSED",
  "CANCELED",
  "SUCCESS",
  "CANCELED_BY_ADMIN",
  "EXPIRED",
  "COMPLETED_BY_ADMIN",
];

const OrderCardContent: React.FC<OrderCardContentProps> = ({
  order,
  user,
  showDetails,
  walletAddress,
  setWalletAddress,
}) => {
  const { t } = useTranslation();
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const formattedFiatAmount = order.fiatAmount
    ? parseFloat(order.fiatAmount).toFixed(2)
    : order.fiatAmount;

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

  return (
    <CardContent className="pb-6 pt-0 pb-3">
      <div className="space-y-1">
        <div className="pb-0">
          <p>
            {t("for")}{" "}
            <span className="font-bold">${formattedFiatAmount} ARS</span>
          </p>
        </div>
        <div>
          <span className="text-xs block">
            {order.paymentMethods?.map((method, index) => (
              <PaymentMethodDisplay key={index} method={method} />
            ))}
          </span>
        </div>
        {order.buyerId && order.type === "SELL" && (
          <div className="text-xs text-black">
            <div>
              {t("buyer")}:{" "}
              <span className="font-semibold">
                {order.buyerId === user?.userId
                  ? t("you")
                  : order.buyerUsername
                  ? order.buyerUsername
                  : order.buyerId}
              </span>
            </div>
            {!order.sellerHasRated &&
              order.status &&
              finishedStatusesList.includes(order.status) && (
                <Rating orderId={order.id!!} ratedId={order.buyerId} />
              )}
          </div>
        )}
        {order.sellerId && order.type === "BUY" && (
          <div>
            <span className="text-xs text-gray-600 block">
              {t("seller")}:{" "}
              {order.sellerId === user?.userId
                ? t("you")
                : order.sellerUsername
                ? order.sellerUsername
                : order.sellerId}
            </span>
            {!order.buyerHasRated &&
              order.status &&
              finishedStatusesList.includes(order.status) && (
                <Rating orderId={order.id!!} ratedId={order.sellerId} />
              )}
          </div>
        )}
        {user && showDetails && order.type === ("SELL" as OrderType) && (
          <div className="pt-2">
            <div className="space-y-2">
              <span className="text-xs block font-semibold">
                {t("take_order_information")}
              </span>
              <div className="flex space-x-2">
                <Input
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter wallet address"
                  className="flex-grow"
                  disabled={order.status !== "PENDING"}
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
          </div>
        )}
      </div>
    </CardContent>
  );
};

export default OrderCardContent;
