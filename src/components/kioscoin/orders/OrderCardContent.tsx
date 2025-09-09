// OrderCardContent.tsx
import React, { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";

// Estilos para la animación de titileo del botón Chat
const chatGlowStyles = `
  @keyframes chatGlow {
    0%, 100% {
      box-shadow: 
        0 0 15px rgba(252, 206, 76, 0.4),
        0 0 30px rgba(139, 95, 220, 0.3),
        0 0 45px rgba(158, 140, 190, 0.2),
        inset 0 0 15px rgba(252, 206, 76, 0.1);
    }
    50% {
      box-shadow: 
        0 0 25px rgba(252, 206, 76, 0.8),
        0 0 50px rgba(139, 95, 220, 0.6),
        0 0 75px rgba(158, 140, 190, 0.4),
        inset 0 0 25px rgba(252, 206, 76, 0.3);
    }
  }
`;
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
  // Agregar estilos de animación al head
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = chatGlowStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
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

  const handleUpdatePaymentMethod = (updatedMethods: PaymentMethod[]) => {
    setSelectedPaymentMethods(updatedMethods);
    onPaymentMethodsChange?.(updatedMethods);
  };

  return (
    <CardContent className="pb-3 mt-2 font-secondary">
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
                  if (!open) handleChatClose(); // Call cleanup when sheet is closed
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    onClick={handleChatIconClick}
                    className="relative p-3 rounded-xl overflow-hidden"
                    style={{
                      background: "#8b5fdc",
                      border: "2px solid #fcce4c",
                      boxShadow: `
                        0 0 15px rgba(252, 206, 76, 0.4),
                        0 0 30px rgba(139, 95, 220, 0.3),
                        0 0 45px rgba(158, 140, 190, 0.2),
                        inset 0 0 15px rgba(252, 206, 76, 0.1)
                      `,
                      animation: "chatGlow 2s ease-in-out infinite",
                    }}
                  >
                    {/* Contenido del botón */}
                    <div className="relative z-10 flex items-center gap-2">
                      <MessageCircle
                        size={20}
                        className="text-white drop-shadow-lg"
                        style={{
                          filter: "drop-shadow(0 0 6px #fcce4c)",
                          animation:
                            "brandIconGlow 3s ease-in-out infinite alternate",
                        }}
                      />
                      <span
                        className="font-semibold text-white tracking-wide text-sm"
                        style={{
                          textShadow: "0 0 8px #fcce4c, 0 0 16px #efb810",
                          animation:
                            "brandTextGlow 3s ease-in-out infinite alternate",
                        }}
                      >
                        Chat
                      </span>
                    </div>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[75vh]" closeText="">
                  <SheetTitle></SheetTitle>
                  <ChatInterface order={order} userId={user?.id} />
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
