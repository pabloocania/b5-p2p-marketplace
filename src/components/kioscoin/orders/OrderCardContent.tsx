// OrderCardContent.tsx
import React, { useEffect, useMemo, useState } from "react";
import { CardContent } from "@/components/ui/card";

// Minimal chat button – removed glow/animations
import {
  KioscoinUser,
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from "b5-api-client";
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
import { formatFiatAmount } from "@/lib/utils";
import PaymentMethodSelector from "./create-orders/PaymentMethodSelector";

interface OrderCardContentProps {
  order: Order;
  user: KioscoinUser | undefined;
  showDetails: boolean;
  walletAddress: string;
  setWalletAddress: (value: string) => void;
  onPaymentMethodsChange?: (methods: PaymentMethod[]) => void;
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
  onPaymentMethodsChange,
}) => {
  // No animated styles for chat button
  const { t } = useTranslation();
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    PaymentMethod[]
  >([]);
  const availableMethods = ConfigStore.getInstance().getPaymentMethods();

  useEffect(() => {
    setClipboardSupported("clipboard" in navigator);
  }, []);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);

  const handleChatIconClick = () => {
    setIsChatOpen(true);
    setHasUnreadMessage(false);
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

  const handleUpdatePaymentMethod = (updatedMethods: PaymentMethod[]) => {
    setSelectedPaymentMethods(updatedMethods);
    onPaymentMethodsChange?.(updatedMethods);
  };

  useEffect(() => {
    if (order.paymentMethods && order.paymentMethods.length > 0) {
      setSelectedPaymentMethods(order.paymentMethods);
      return;
    }

    if (
      isSeller &&
      user?.settings?.paymentMethods &&
      user.settings.paymentMethods.length > 0
    ) {
      setSelectedPaymentMethods(user.settings.paymentMethods);
    }
  }, [
    order.paymentMethods,
    order.id,
    isSeller,
    user?.settings?.paymentMethods,
  ]);

  const paymentMethodsToDisplay = useMemo(() => {
    if (order.paymentMethods && order.paymentMethods.length > 0) {
      return order.paymentMethods;
    }

    if (selectedPaymentMethods.length > 0) {
      return selectedPaymentMethods;
    }

    return [] as PaymentMethod[];
  }, [order.paymentMethods, selectedPaymentMethods]);

  return (
    <CardContent className="pb-2 mt-2 font-secondary">
      <div className="rounded-lg space-y-1 px-2 bg-secondary bg-opacity-10 space-y-1 pt-1">
        {/* Order header */}
        <div className="flex justify-between items-center w-full text-xl font-bold">
          {/* Order type and amount */}
          <div className="flex space-x-1 items-baseline">
            <span className="text-base text-primary text-lg">
              {order.type === "SELL" ? t("sells") : t("buys")}
            </span>
            <span className="flex">
              <CryptoAmountIcon
                formattedAmount={order.amount!!}
                tokenCode={order.tokenCode?.toLowerCase()!!}
                textSizeClass="text-lg text-dark"
                amountTextClassName="mr-1"
              />
            </span>
          </div>
          {/* Chat icon */}
          {order.chatId && !isOrderCompleted(order.status!!) && (
            <div className="flex items-center">
              <Sheet
                open={isChatOpen}
                onOpenChange={(open) => {
                  setIsChatOpen(open);
                  if (!open) handleChatClose();
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    onClick={handleChatIconClick}
                    className={`p-2 rounded-md bg-white text-primary border ${
                      hasUnreadMessage
                        ? "border-primary ring-2 ring-primary animate-pulse"
                        : "border-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle size={18} />
                      <span className="text-sm">Chat</span>
                    </div>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[75vh]" closeText="">
                  <SheetTitle></SheetTitle>
                  <ChatInterface
                    order={order}
                    userId={user?.id}
                    onIncomingMessage={() => {
                      if (!isChatOpen) setHasUnreadMessage(true);
                    }}
                  />
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
        {/* Order details */}
        <div className="flex justify-between w-full pb-1 space-y-2 pt-1 font-secondary">
          <div className="w-1/2 min-w-[60%] flex flex-col space-y-0.5">
            <div className="flex-1">
              <p className="text-left w-full text-primary whitespace-nowrap overflow-hidden text-ellipsis text-sm">
                {t("for")}{" "}
                <span className="text-dark text-sm">
                  {hasValidFiatData(order)
                    ? formatFiatAmount(order.fiatAmount, order.fiatCode)
                    : formatFiatAmount("0", "ARS")}
                </span>
              </p>
            </div>
            <div className="flex-1">
              <p className="text-left w-full text-xs text-primary">
                {t("on")}{" "}
                <span className="font-medium text-dark text-xs">
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
            {paymentMethodsToDisplay.map((method, index) => (
              <PaymentMethodDisplay key={index} method={method} />
            ))}
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
      {order.status == "PENDING" &&
        user &&
        showDetails &&
        order.type === ("SELL" as OrderType) && (
          <div className="py-2">
            <AddressInput
              walletAddress={walletAddress}
              setWalletAddress={setWalletAddress}
              orderStatus={order.status ? order.status : "CANCELED"}
            />
          </div>
        )}
      {order.status == "PENDING" &&
        user &&
        showDetails &&
        order.type === ("BUY" as OrderType) && (
          <div className="py-2">
            <PaymentMethodSelector
              selectedMethods={selectedPaymentMethods}
              onChange={handleUpdatePaymentMethod}
              methods={availableMethods}
              readOnly={true}
            />
          </div>
        )}
    </CardContent>
  );
};

export default OrderCardContent;
