"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Order, PaymentMethod } from "b5-api-client";
import { useKioscoinUserContext } from "../users/KioscoinUserContext";
import OrderStatusBar from "./OrderStatus";
import { useTranslation } from "react-i18next";
import OrderCardHeader from "./OrderCardHeader";
import OrderCardContent from "./OrderCardContent";
import OrderCardFooter from "./OrderCardFooter";
import ViewHistoryButton from "./ViewHistoryButton";
import CopyIdButton from "./CopyIdButton";
import DisputeOrderButton from "../dispute/DisputeOrderButton";
import ChatButton from "./ChatButton";

interface OrderCardProps {
  orderDTO: Order | undefined;
  onSelect?: (order: Order) => void;
  showDetails?: boolean;
  onRefresh?: () => void;
}

export function OrderCard({
  orderDTO,
  onSelect,
  showDetails = false,
  onRefresh,
}: OrderCardProps) {
  const { t } = useTranslation();
  const [walletAddress, setWalletAddress] = useState("");
  const [order, setOrder] = useState(orderDTO);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    PaymentMethod[]
  >([]);
  const { user } = useKioscoinUserContext();

  useEffect(() => {
    setOrder(orderDTO);
  }, [orderDTO]);

  useEffect(() => {
    if (order?.paymentMethods && order.paymentMethods.length > 0) {
      setSelectedPaymentMethods(order.paymentMethods);
    }
  }, [order?.id, order?.paymentMethods]);

  const handlePaymentMethodsChange = (methods: PaymentMethod[]) => {
    setSelectedPaymentMethods(methods);
  };

  const isBuyer = user?.id === order?.buyerId;
  const isSeller = user?.id === order?.sellerId;

  const canBuyerDispute = isBuyer && order?.buyerCanDispute;
  const canSellerDispute = isSeller && order?.sellerCanDispute;
  const buyerDisputed = isBuyer && order?.buyerDisputed;
  const sellerDisputed = isSeller && order?.sellerDisputed;
  const alreadyDisputed = buyerDisputed || sellerDisputed;

  const canShowDisputeButton =
    (canBuyerDispute || canSellerDispute) && !alreadyDisputed;

  const renderHistoryButton = () =>
    user ? (
      <div className="flex font-secondary w-full shadow-xs">
        <ViewHistoryButton orderId={order?.id} />
      </div>
    ) : null;

  const renderCopyIdButton = () =>
    user ? (
      <div className="flex font-secondary w-full shadow-xs">
        <CopyIdButton orderId={order?.id} />
      </div>
    ) : null;

  const renderDisputeButton = () => (
    <div className="flex font-secondary w-full shadow-xs">
      <DisputeOrderButton order={order ?? ({} as Order)} />
    </div>
  );

  const renderChatButton = () => {
    const isOrderCompleted = (status: string): boolean => {
      const completedStatuses = [
        "COMPLETED",
        "COMPLETED_BY_ADMIN",
        "RELEASED",
        "CANCELLED",
      ];
      return completedStatuses.includes(status);
    };

    return order?.chatId && !isOrderCompleted(order.status ?? "") ? (
      <div className="flex font-secondary w-full shadow-xs">
        <ChatButton order={order} user={user} />
      </div>
    ) : null;
  };

  if (!order) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("no_orders_available")}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card
      className="w-full border border-none shadow-primary/20"
      variant="shadow"
    >
      <OrderStatusBar status={order.status ?? "Unknown"} />
      <OrderCardHeader order={order} />
      <OrderCardContent
        order={order}
        user={user}
        walletAddress={walletAddress}
        showDetails={showDetails}
        setWalletAddress={setWalletAddress}
        onPaymentMethodsChange={handlePaymentMethodsChange}
      />
      <OrderCardFooter
        order={order}
        user={user}
        onRefresh={onRefresh}
        onSelect={onSelect}
        walletAddress={walletAddress}
        showDetails={showDetails}
        setOrder={setOrder}
        paymentMethods={selectedPaymentMethods}
      />
      {/* <Separator className="mb-1" /> */}
      <div className="px-3 py-2 space-y-2">
        {/* First row: History, Copy ID, Chat */}
        <div
          className={`grid ${(() => {
            const showChat =
              order?.chatId &&
              ![
                "COMPLETED",
                "COMPLETED_BY_ADMIN",
                "RELEASED",
                "CANCELLED",
              ].includes(order.status ?? "");
            return showChat ? "grid-cols-3" : "grid-cols-2";
          })()} gap-2`}
        >
          {renderHistoryButton()}
          {renderCopyIdButton()}
          {renderChatButton()}
        </div>
        {/* Second row: Dispute button */}
        {canShowDisputeButton && (
          <div className="grid grid-cols-1 gap-2">{renderDisputeButton()}</div>
        )}
      </div>
      <p className="text-[10px] font-secondary text-dark pb-1 text-right pr-4">
        ID: {order.id}
      </p>
    </Card>
  );
}
