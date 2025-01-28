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
import { SellerText } from "./SellerText";
import { BuyerText } from "./BuyerText";
import AddressInput from "./AddressInput";

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
        {order.sellerId && order.type === "BUY" && (
          <SellerText order={order} userId={user?.userId} />
        )}
        {order.buyerId && order.type === "SELL" && (
          <BuyerText order={order} userId={user?.userId} />
        )}
        {user && showDetails && order.type === ("SELL" as OrderType) && (
          <AddressInput
            walletAddress={walletAddress}
            setWalletAddress={setWalletAddress}
            orderStatus={order.status ? order.status : "CANCELED"}
          />
        )}
      </div>
    </CardContent>
  );
};

export default OrderCardContent;
