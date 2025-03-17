// OrderCardContent.tsx
import React, { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Order, OrderStatus, OrderType } from "b5-api-client";
import PaymentMethodDisplay from "./PaymentMethodDisplay";
import { useTranslation } from "react-i18next";
import { UserProps } from "@/lib/useUser";
import { SellerText } from "./SellerText";
import { BuyerText } from "./BuyerText";
import AddressInput from "./AddressInput";
import { CryptoAmountIcon } from "./CryptoIcon";
import OrderCreatedDate from "./OrderCreatedDate";
import { getBlockchainDisplayName } from "@/lib/ConfigStore";
import { BlockchainName } from "@/lib/web3/PublicClientManager";
import { MessageCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Import Sheet components
import { ChatInterface } from "@/chat/ChatInterface";
import { Button } from "./button";
import { Rating } from "./Rating";

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

  useEffect(() => {
    setClipboardSupported("clipboard" in navigator);
  }, []);

  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatIconClick = () => {
    setIsChatOpen(true);
  };

  // Cleanup function to handle WebSocket disconnection
  const handleChatClose = () => {
    setIsChatOpen(false);
    // Add any additional cleanup logic here if needed
  };

  const formatFiatAmount = (
    amount: string | undefined,
    fiatCode: string | undefined
  ) => {
    if (!amount) return "0,00";

    const numAmount = parseFloat(amount);
    const currencySymbol = fiatCode === "EUR" ? "€" : "$";

    const formattedNumber = new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);

    // Agregar el símbolo de moneda al inicio
    return `${currencySymbol} ${formattedNumber}`;
  };

  const hasValidFiatData = (
    order: Order
  ): order is Order & { fiatAmount: string; fiatCode: string } => {
    return (
      typeof order.fiatAmount === "string" && typeof order.fiatCode === "string"
    );
  };

  const isBuyer = order.buyerId === user?.userId;
  const isSeller = order.sellerId === user?.userId;
  const buyerHasNotRated = isBuyer && !order.buyerHasRated;
  const sellerHasNotRated = isSeller && !order.sellerHasRated;

  return (
    <CardContent className="pb-3 mt-1">
      <div className="rounded-lg space-y-1 px-2 bg-secondary bg-opacity-10 space-y-1 pt-1">
        <div className="flex justify-between items-center w-full">
          <div className="flex space-x-1">
            <span className="text-2xl text-primary">
              {order.type === "SELL" ? t("sells") : t("buys")}
            </span>
            <span className="flex">
              <CryptoAmountIcon
                amount={order.amount!!}
                tokenCode={order.tokenCode?.toLowerCase()!!}
              />
            </span>
          </div>
          {order.chatId && (
            <div className="flex">
              <Sheet
                open={isChatOpen}
                onOpenChange={(open) => {
                  setIsChatOpen(open);
                  if (!open) handleChatClose(); // Call cleanup when sheet is closed
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    onClick={handleChatIconClick}
                    className="gap-1 p-2 items-center justify-center bg-white text-terciary"
                  >
                    <MessageCircle size={20} />
                    <span>Chat</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh]" closeText="">
                  <SheetTitle></SheetTitle>
                  <ChatInterface order={order} userId={user?.userId} />
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
        <div className="flex">
          <p className="text-left w-full text-primary">
            {t("for")}{" "}
            <span className="font-bold text-primary">
              {hasValidFiatData(order)
                ? formatFiatAmount(order.fiatAmount, order.fiatCode)
                : formatFiatAmount("0", "ARS")}
            </span>
          </p>
        </div>
        <div className="text-left w-full">
          <p className="text-left w-full text-xs text-primary">
            {t("on")}{" "}
            <span className="font-bold text-primary">
              {getBlockchainDisplayName(order.blockchain as BlockchainName)}
            </span>
          </p>
        </div>
        <div className="text-left w-full">
          <span className="text-xs block pt-4">
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
        {order.createdAt && (
          <div>
            <OrderCreatedDate createdAt={order.createdAt} />
          </div>
        )}
      </div>
      {order.status &&
        finishedStatusesList.includes(order.status) &&
        (buyerHasNotRated || sellerHasNotRated) && (
          <Rating
            orderId={order.id!!}
            ratedId={isBuyer ? order.sellerId! : order.buyerId!}
            ratedUsername={
              isBuyer ? "@" + order.sellerUsername! : "@" + order.buyerUsername!
            }
          />
        )}
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
