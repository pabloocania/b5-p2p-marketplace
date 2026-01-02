"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Order, PaymentMethod } from "b5-api-client";
import { useKioscoinUserContext } from "../users/KioscoinUserContext";
import OrderStatusBar from "./OrderStatus";
import { useTranslation } from "react-i18next";
import OrderCardHeader from "./OrderCardHeader";
import OrderCardContent from "./OrderCardContent";
import OrderCardFooter from "./OrderCardFooter";
import ViewHistoryButton from "./ViewHistoryButton";
import { ShareOrderButton } from "./ShareOrderButton";
import DisputeOrderButton from "../dispute/DisputeOrderButton";
import ChatButton from "./ChatButton";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import { CancelOrderButton } from "./CancelOrderButton";

const FINAL_STATUSES = [
  "COMPLETED",
  "COMPLETED_BY_ADMIN",
  "RELEASED",
  "CANCELLED",
  "CANCELED",
  "EXPIRED",
  "CLOSED",
] as const;

const isFinalStatus = (status: string): boolean =>
  FINAL_STATUSES.includes(status as (typeof FINAL_STATUSES)[number]);

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
  const { swAddress } = useEtherspotSdk();
  const [walletAddress, setWalletAddress] = useState(swAddress || "");
  const [order, setOrder] = useState(orderDTO);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    PaymentMethod[]
  >([]);
  const [showCopied, setShowCopied] = useState(false);
  const { user } = useKioscoinUserContext();

  useEffect(() => {
    setOrder(orderDTO);
  }, [orderDTO]);

  useEffect(() => {
    // For PENDING BUY orders, don't pre-populate from order.paymentMethods
    // because the seller needs to explicitly provide their own payment methods
    const isPendingBuyOrder =
      order?.status === "PENDING" && order?.type === "BUY";
    const isNotCreator = user?.id !== order?.creatorId;

    // Only pre-populate for non-PENDING orders or when user is already involved
    if (
      order?.paymentMethods &&
      order.paymentMethods.length > 0 &&
      !(isPendingBuyOrder && isNotCreator)
    ) {
      setSelectedPaymentMethods(order.paymentMethods);
    }
  }, [
    order?.id,
    order?.paymentMethods,
    order?.status,
    order?.type,
    order?.creatorId,
    user?.id,
  ]);

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
    user && order?.status !== "PENDING" ? (
      <div className="flex font-secondary w-full shadow-xs">
        <ViewHistoryButton orderId={order?.id} />
      </div>
    ) : null;

  const isPending = order?.status === "PENDING";

  const renderShareButton = () => {
    if (!user || !isPending || !order?.id) return null;

    return (
      <div className="flex font-secondary w-full shadow-xs">
        <ShareOrderButton orderId={order.id} />
      </div>
    );
  };

  const handleCopyOrderId = async () => {
    if (order?.id) {
      await navigator.clipboard.writeText(order.id);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleDisputeCreated = () => {
    // Optimistic local flag to avoid duplicate dispute creation
    setOrder((prev) => {
      if (!prev) return prev as any;
      const next: Order = { ...prev };
      if (isBuyer) {
        (next as any).buyerDisputed = true;
      }
      if (isSeller) {
        (next as any).sellerDisputed = true;
      }
      return next;
    });
    if (onRefresh) onRefresh();
  };

  const handleOrderCancelled = () => {
    setOrder((prev) => {
      if (!prev) return prev as any;
      return { ...prev, status: "CANCELED" };
    });
    if (onRefresh) onRefresh();
  };

  const renderDisputeButton = () => (
    <div className="flex font-secondary w-full shadow-xs">
      <DisputeOrderButton
        order={order ?? ({} as Order)}
        onDisputeCreated={handleDisputeCreated}
      />
    </div>
  );

  const renderCancelButton = () => {
    if (!user || !order) return null;

    // CancelOrderButton internally checks if user can cancel
    return (
      <CancelOrderButton order={order} onCancelled={handleOrderCancelled} />
    );
  };

  const renderChatButton = () =>
    order?.chatId && !isFinalStatus(order.status ?? "") ? (
      <div className="flex font-secondary w-full shadow-xs">
        <ChatButton order={order} user={user} />
      </div>
    ) : null;

  if (!order) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("no_orders_available")}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // const showStatusBar = !isFinalStatus(order.status ?? "");

  return (
    <Card
      className="w-full border border-none shadow-primary/20"
      variant="shadow"
    >
      {/* {showStatusBar && <OrderStatusBar status={order.status ?? "Unknown"} />} */}
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
        {/* First row: History, Share (if pending) OR Cancel, Chat */}
        <div className="flex gap-2">
          {renderHistoryButton()}
          {renderShareButton()}
          {renderChatButton()}
          {renderCancelButton()}
        </div>
        {/* Second row: Dispute button or status */}
        {(canShowDisputeButton || alreadyDisputed) && (
          <div className="grid grid-cols-1 gap-2">{renderDisputeButton()}</div>
        )}
      </div>
      <div className="relative pb-1 pr-3">
        <p
          className="text-[10px] font-secondary text-dark text-right cursor-pointer hover:text-primary transition-colors"
          onClick={handleCopyOrderId}
          title={t("copy_id")}
        >
          {order.id}
        </p>
        {showCopied && (
          <div className="absolute right-4 -top-5 bg-secondary text-dark font-secondary text-xs px-1 py-0.5 rounded shadow-lg z-10">
            {t("copied")}
          </div>
        )}
      </div>
    </Card>
  );
}
