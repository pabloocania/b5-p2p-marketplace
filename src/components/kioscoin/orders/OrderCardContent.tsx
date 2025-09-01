// OrderCardContent.tsx
import React, { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
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
import { formatFiatAmount, formatTokenAmount } from "@/lib/utils";
import CompactPaymentMethodSelector from "./create-orders/CompactPaymentMethodSelector";

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
  const { t } = useTranslation();
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    PaymentMethod[]
  >([]);

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

  const handleTogglePaymentMethod = (method: PaymentMethod) => {
    const newSelectedMethods = selectedPaymentMethods.some(
      (m) => m.entity === method.entity
    )
      ? selectedPaymentMethods.filter((m) => m.entity !== method.entity)
      : [...selectedPaymentMethods, method];

    setSelectedPaymentMethods(newSelectedMethods);
    onPaymentMethodsChange?.(newSelectedMethods);
  };

  const handleUpdatePaymentMethod = (updatedMethod: PaymentMethod) => {
    const newSelectedMethods = selectedPaymentMethods.map((method) =>
      method.entity === updatedMethod.entity ? updatedMethod : method
    );

    setSelectedPaymentMethods(newSelectedMethods);
    onPaymentMethodsChange?.(newSelectedMethods);
  };

  return (
    <CardContent className="pb-3 mt-2">
      <div className="rounded-lg space-y-1 px-2 bg-secondary bg-opacity-10 space-y-1 pt-1">
        {/* Order header */}
        <div className="flex justify-between items-center w-full">
          {/* Order type and amount */}
          <div className="flex space-x-1 items-baseline">
            <span className="text-base text-primary">
              {order.type === "SELL" ? t("sells") : t("buys")}
            </span>
            <span className="flex">
              <CryptoAmountIcon
                formattedAmount={order.amount!!}
                tokenCode={order.tokenCode?.toLowerCase()!!}
                textSizeClass="text-sm"
                amountTextClassName="text-gray-500 font-medium mr-1"
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
                    className="relative p-3 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-1 group mb-2"
                    style={{
                      background: "#8b5fdc",
                      border: "2px solid #fcce4c",
                      boxShadow: `
                        0 0 15px rgba(252, 206, 76, 0.4),
                        0 0 30px rgba(139, 95, 220, 0.3),
                        0 0 45px rgba(158, 140, 190, 0.2),
                        inset 0 0 15px rgba(252, 206, 76, 0.1)
                      `,
                      animation: "brandPulse 3s ease-in-out infinite alternate",
                    }}
                  >
                    {/* Efecto de ondas suave */}
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(252,206,76,0.2) 0%, transparent 70%)",
                        animation: "gentleRipple 2s infinite",
                      }}
                    />

                    {/* Líneas eléctricas delicadas */}
                    <div
                      className="absolute top-0 left-0 w-full h-0.5 opacity-60"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, #fcce4c, #efb810, transparent)",
                        animation: "delicateFlow 3s linear infinite",
                      }}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-full h-0.5 opacity-60"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, #9e8cbe, #8b5fdc, transparent)",
                        animation: "delicateFlow 3s linear infinite reverse",
                      }}
                    />

                    {/* Brillo sutil en los bordes */}
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(45deg, transparent, rgba(252,206,76,0.1), transparent, rgba(139,95,220,0.1), transparent)",
                        animation: "borderGlow 4s ease-in-out infinite",
                      }}
                    />

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

                    {/* Partículas delicadas */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-0.5 h-0.5 rounded-full opacity-60"
                          style={{
                            left: `${20 + i * 15}%`,
                            background: i % 2 === 0 ? "#fcce4c" : "#9e8cbe",
                            animation: `delicateParticle 4s infinite ${
                              i * 0.8
                            }s linear`,
                          }}
                        />
                      ))}
                    </div>

                    <style jsx>{`
                      @keyframes brandPulse {
                        0% {
                          box-shadow: 0 0 15px rgba(252, 206, 76, 0.4),
                            0 0 30px rgba(139, 95, 220, 0.3),
                            0 0 45px rgba(158, 140, 190, 0.2),
                            inset 0 0 15px rgba(252, 206, 76, 0.1);
                        }
                        100% {
                          box-shadow: 0 0 20px rgba(252, 206, 76, 0.6),
                            0 0 40px rgba(139, 95, 220, 0.4),
                            0 0 60px rgba(158, 140, 190, 0.3),
                            inset 0 0 20px rgba(252, 206, 76, 0.2);
                        }
                      }

                      @keyframes gentleRipple {
                        0% {
                          transform: scale(0.8);
                          opacity: 0.3;
                        }
                        100% {
                          transform: scale(1.5);
                          opacity: 0;
                        }
                      }

                      @keyframes delicateFlow {
                        0% {
                          transform: translateX(-100%);
                          opacity: 0;
                        }
                        50% {
                          opacity: 0.6;
                        }
                        100% {
                          transform: translateX(100%);
                          opacity: 0;
                        }
                      }

                      @keyframes borderGlow {
                        0%,
                        100% {
                          opacity: 0.3;
                          transform: rotate(0deg);
                        }
                        50% {
                          opacity: 0.6;
                          transform: rotate(180deg);
                        }
                      }

                      @keyframes brandIconGlow {
                        0% {
                          filter: drop-shadow(0 0 6px #fcce4c);
                        }
                        100% {
                          filter: drop-shadow(0 0 10px #fcce4c)
                            drop-shadow(0 0 18px #efb810);
                        }
                      }

                      @keyframes brandTextGlow {
                        0% {
                          text-shadow: 0 0 8px #fcce4c, 0 0 16px #efb810;
                        }
                        100% {
                          text-shadow: 0 0 12px #fcce4c, 0 0 24px #efb810,
                            0 0 32px #9e8cbe;
                        }
                      }

                      @keyframes delicateParticle {
                        0% {
                          transform: translateY(100%) scale(0);
                          opacity: 0;
                        }
                        30% {
                          opacity: 0.6;
                          transform: translateY(70%) scale(1);
                        }
                        70% {
                          opacity: 0.4;
                          transform: translateY(30%) scale(0.8);
                        }
                        100% {
                          transform: translateY(-10%) scale(0);
                          opacity: 0;
                        }
                      }
                    `}</style>
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
              <p
                className="text-left w-full text-primary whitespace-nowrap overflow-hidden text-ellipsis text-sm"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {t("for")} {" $ "}
                <span
                  className="font-medium text-gray-500 text-sm"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {hasValidFiatData(order)
                    ? formatFiatAmount(order.fiatAmount, order.fiatCode)
                    : formatFiatAmount("0", "ARS")}
                </span>
              </p>
            </div>
            <div className="flex-1">
              <p
                className="text-left w-full text-xs text-primary"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {t("on")}{" "}
                <span
                  className="font-medium text-primary/80 text-xs"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
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
            <CompactPaymentMethodSelector
              selectedMethods={selectedPaymentMethods}
              onToggle={handleTogglePaymentMethod}
              onUpdateMethod={handleUpdatePaymentMethod}
            />
          </div>
        )}
    </CardContent>
  );
};

export default OrderCardContent;
