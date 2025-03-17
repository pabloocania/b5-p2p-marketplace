// OrderCardContent.tsx
import React, { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Order, OrderType } from "b5-api-client";
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

  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatIconClick = () => {
    setIsChatOpen(true);
  };

  // Cleanup function to handle WebSocket disconnection
  const handleChatClose = () => {
    setIsChatOpen(false);
    // Add any additional cleanup logic here if needed
  };

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
              ${formattedFiatAmount} ARS
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
