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
import ViewHistoryButton from "./ViewHistoryButton";
import CopyIdButton from "./CopyIdButton";
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

  // 2️⃣ Determinar si el usuario es comprador o vendedor
  const isBuyer = user?.id === order?.buyerId;
  const isSeller = user?.id === order?.sellerId;

  // 3️⃣ Definir la lógica de visibilidad del botón
  const canShowDisputeButton =
    (isBuyer && order?.status === "FIAT_SENT") ||
    (isSeller && order?.status === "ACTIVE");

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
      <div className="px-4 py-3">
        <div className="grid grid-cols-3 gap-3">
          {/* Card Ver Historial */}
          {user && (
            <div
              className="relative rounded-lg p-1.5 cursor-pointer overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1)",
                border: "1px solid rgba(139, 95, 220, 0.2)",
                boxShadow:
                  "0 4px 15px rgba(139, 95, 220, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
              }}
            >
              <div className="relative z-10">
                <ViewHistoryButton orderId={order.id} />
              </div>
            </div>
          )}

          {/* Card Copiar ID */}
          {user && (
            <div
              className="relative rounded-lg p-1.5 cursor-pointer overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #fefce8, #fef3c7, #fed7aa)",
                border: "1px solid rgba(252, 206, 76, 0.3)",
                boxShadow:
                  "0 4px 15px rgba(252, 206, 76, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
              }}
            >
              <div className="relative z-10">
                <CopyIdButton orderId={order.id} />
              </div>
            </div>
          )}

          {/* Card Orden en Disputa */}
          {canShowDisputeButton && (
            <div
              className="relative rounded-lg p-1.5 cursor-pointer overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #fef2f2, #fecaca, #fca5a5)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                boxShadow:
                  "0 4px 15px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
              }}
            >
              <div className="relative z-10">
                <DisputeOrderButton order={order} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
