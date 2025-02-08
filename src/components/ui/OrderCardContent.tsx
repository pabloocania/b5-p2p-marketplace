// OrderCardContent.tsx
import React, { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Order, OrderStatus, OrderType, PaymentMethod } from "b5-api-client";
import PaymentMethodDisplay from "./PaymentMethodDisplay";
import { useTranslation } from "react-i18next";
import { UserProps } from "@/lib/useUser";
import { SellerText } from "./SellerText";
import { BuyerText } from "./BuyerText";
import AddressInput from "./AddressInput";
import { CryptoAmountIcon } from "./CryptoIcon";

interface OrderCardContentProps {
  order: Order;
  user: UserProps | undefined;
  showDetails: boolean;
  walletAddress: string;
  setWalletAddress: (value: string) => void;
}

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
    <CardContent className="pb-3 pt-1">
      <div className="border border-secondary border-opacity-20 rounded-lg space-y-1 px-2 py-2 bg-primary bg-opacity-5 space-y-1">
        <div className="flex space-x-1 text-right w-full">
          <span className="text-2xl text-primary">
            {order.type === "SELL" ? t("sells") : t("buys")}
          </span>
          <span className="flex text-right text-terciary">
            <CryptoAmountIcon
              amount={order.amount!!}
              tokenCode={order.tokenCode?.toLowerCase()!!}
            />
          </span>
        </div>
        <div className="flex">
          <p className="text-left w-full text-primary">
            {t("for")}{" "}
            <span className="font-bold text-primary">
              ${formattedFiatAmount} ARS
            </span>
          </p>
        </div>
        <div className="text-left w-full text-primary">
          <span className="text-xs block">
            {order.paymentMethods?.map((method, index) => (
              <PaymentMethodDisplay key={index} method={method} />
            ))}
          </span>
        </div>
        <div className="text-left w-full">
          {order.sellerId && order.type === "BUY" && (
            <SellerText order={order} userId={user?.userId} />
          )}
        </div>
        <div>
          {order.buyerId && order.type === "SELL" && (
            <BuyerText order={order} userId={user?.userId} />
          )}
        </div>
      </div>
      {user && showDetails && order.type === ("SELL" as OrderType) && (
        <div className="py-2">
          <AddressInput
            walletAddress={walletAddress}
            setWalletAddress={setWalletAddress}
            orderStatus={order.status ? order.status : "CANCELED"}
          />
        </div>
      )}
    </CardContent>
  );
};

export default OrderCardContent;
