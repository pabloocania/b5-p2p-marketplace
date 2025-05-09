// OrderCardContent.tsx
import React, { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { KioscoinUser, Order, OrderStatus, OrderType } from "b5-api-client";
import PaymentMethodDisplay from "../PaymentMethodDisplay";
import { useTranslation } from "react-i18next";
import { SellerText } from "./SellerText";
import { BuyerText } from "./BuyerText";
import AddressInput from "./AddressInput";
import { CryptoAmountIcon } from "../CryptoIcon";
import OrderCreatedDate from "./OrderCreatedDate";
import {
  BlockchainName,
  ConfigStore,
  getBlockchainDisplayName,
} from "@/lib/ConfigStore";
import { MessageCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Import Sheet components
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Button } from "../../ui/button";
import { Rating } from "../Rating";
import { formatFiatAmount, formatTokenAmount } from "@/lib/utils";
import { parseUnits } from "viem";

interface OrderCardContentProps {
  order: Order;
  user: KioscoinUser | undefined;
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

  const hasValidFiatData = (
    order: Order
  ): order is Order & { fiatAmount: string; fiatCode: string } => {
    return (
      typeof order.fiatAmount === "string" && typeof order.fiatCode === "string"
    );
  };

  const isBuyer = order.buyerId === user?.id;
  const isSeller = order.sellerId === user?.id;
  const buyerHasNotRated = isBuyer && !order.buyerHasRated;
  const sellerHasNotRated = isSeller && !order.sellerHasRated;

  function isOrderCompleted(status: string): boolean {
    const completedStatuses = [
      "COMPLETED",
      "COMPLETED_BY_ADMIN",
      "RELEASED",
      "CANCELLED",
    ];

    return completedStatuses.includes(status);
  }

  return (
    <CardContent className="pb-3 mt-2">
      <div className="rounded-lg space-y-1 px-2 bg-secondary bg-opacity-10 space-y-1 pt-1">
        {/* Order header */}
        <div className="flex justify-between items-center w-full">
          {/* Order type and amount */}
          <div className="flex space-x-1">
            <span className="text-2xl text-primary">
              {order.type === "SELL" ? t("sells") : t("buys")}
            </span>
            <span className="flex">
              <CryptoAmountIcon
                formattedAmount={order.amount!!}
                tokenCode={order.tokenCode?.toLowerCase()!!}
              />
            </span>
          </div>
          {/* Chat icon */}
          {order.chatId && !isOrderCompleted(order.status!!) && (
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
                    className="gap-1 p-2 items-center justify-center bg-white text-terciary border border-secondary border-opacity-50"
                  >
                    <MessageCircle size={20} />
                    <span>Chat</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh]" closeText="">
                  <SheetTitle></SheetTitle>
                  <ChatInterface order={order} userId={user?.id} />
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
        {/* Order details */}
        <div className="flex justify-between w-full pb-1 space-y-2 pt-1">
          <div className="w-1/2 min-w-[60%] flex flex-col space-y-1">
            <div className="flex-1">
              <p className="text-left w-full text-primary">
                {t("for")}{" "}
                <span className="font-bold text-primary">
                  {hasValidFiatData(order)
                    ? formatFiatAmount(order.fiatAmount, order.fiatCode)
                    : formatFiatAmount("0", "ARS")}
                </span>
              </p>
            </div>
            <div className="flex-1">
              <p className="text-left w-full text-xs text-primary">
                {t("on")}{" "}
                <span className="font-bold text-primary">
                  {getBlockchainDisplayName(order.blockchain as BlockchainName)}
                </span>
              </p>
            </div>
            <div className="flex-1">
              {order.sellerId && order.type === "BUY" && (
                <SellerText order={order} userId={user?.id} />
              )}
              {order.buyerId && order.type === "SELL" && (
                <BuyerText order={order} userId={user?.id} />
              )}
            </div>
          </div>
          {/* Payment methods */}
          <div className="text-right">
            <span className="text-xs">
              {order.paymentMethods?.map((method, index) => (
                <PaymentMethodDisplay key={index} method={method} />
              ))}
            </span>
          </div>
        </div>
        {/* Order created date */}
        {order.createdAt && (
          <OrderCreatedDate
            createdAt={order.createdAt}
            status={order.status!!}
          />
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
