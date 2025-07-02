"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Order, PaymentMethod } from "b5-api-client";
import { useUserContext } from "../users/UserContext";
import OrderStatusBar from "./OrderStatus";
import { useTranslation } from "react-i18next";
import OrderCardHeader from "./OrderCardHeader";
import OrderCardContent from "./OrderCardContent";
import OrderCardFooter from "./OrderCardFooter";
import OrderIdLink from "./OrderIdLink";
import DisputeOrderButton from "../dispute/DisputeOrderButton";

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
  const { user } = useUserContext();

  useEffect(() => {
    setOrder(orderDTO);
  }, [orderDTO]);

  const handlePaymentMethodsChange = (methods: PaymentMethod[]) => {
    setSelectedPaymentMethods(methods);
  };

  // mostrar boton?
  //
  // const handleConfirmDispute = () => {
  // 🔒 Lógica para mostrar el botón solo si se cumplen condiciones (comentada temporalmente)
  // const canDisputeOrder = (order: Order, userId?: string): boolean => {
  //   if (!order || !userId) return false;

  //   const isUserInvolved =
  //     order.creatorId === userId ||
  //     order.buyerId === userId ||
  //     order.sellerId === userId;

  //   const disputableStatus = ["ACTIVE", "WAITING_PAYMENT", "FIAT_SENT"];
  //   const isStatusValid = disputableStatus.includes(order.status);

  //   const canDispute = order.buyerCanDispute || order.sellerCanDispute;

  //   return isUserInvolved && isStatusValid && canDispute;
  // };

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
    <Card className="w-full mb-4 border-none" variant="shadow">
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
      <Separator className="mb-1" />
      {order.status !== "PENDING" && (
        <div className="pl-4 pb-1 pt-1 flex items-center gap-4 text-sm h-8">
          <OrderIdLink orderId={order.id}/>
          <span className="mx-2 pb-2.5 text-black-400 select-none">•</span>
          <span className="-pl-6 -mt-2 flex items-center text-sm">
            <DisputeOrderButton order={order} />
          </span>
        </div>
      )}
    </Card>
  );
}
