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

  // 3️⃣ Definir la lógica de visibilidad del botón (sincronizada con DisputeOrderButton)
  const canBuyerDispute = isBuyer && order?.buyerCanDispute;
  const canSellerDispute = isSeller && order?.sellerCanDispute;
  const buyerDisputed = isBuyer && order?.buyerDisputed;
  const sellerDisputed = isSeller && order?.sellerDisputed;
  const alreadyDisputed = buyerDisputed || sellerDisputed;

  const canShowDisputeButton =
    (canBuyerDispute || canSellerDispute) && !alreadyDisputed;

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
    <Card className="w-full mb-4 px-3 py-2" variant="shadow">
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
      <div className="px-4 py-0">
        <div
          className={`${
            canShowDisputeButton
              ? "grid grid-cols-3 gap-1"
              : "flex justify-center gap-2"
          }`}
        >
          {/* Cuando hay disputa - Grid de 3 columnas */}
          {canShowDisputeButton ? (
            <>
              {/* Ver Historial */}
              {user && (
                <div className="relative rounded-lg p-1 cursor-pointer overflow-hidden bg-primary/30 border border-primary/40 shadow-sm z-5">
                  <div className="relative z-5">
                    <ViewHistoryButton orderId={order.id} />
                  </div>
                </div>
              )}

              {/* Copiar ID */}
              {user && (
                <div className="relative rounded-lg p-1 cursor-pointer overflow-hidden bg-secondary/30 border border-secondary/40 shadow-sm z-5">
                  <div className="relative z-5">
                    <CopyIdButton orderId={order.id} />
                  </div>
                </div>
              )}

              {/* Disputar orden */}
              <div
                className="relative rounded-lg p-1 cursor-pointer overflow-hidden z-5"
                style={{
                  background:
                    "linear-gradient(135deg, #fef2f2, #fecaca, #fca5a5)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  boxShadow:
                    "0 4px 15px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                }}
              >
                <div className="relative z-5">
                  <DisputeOrderButton order={order} />
                </div>
              </div>
            </>
          ) : (
            /* Cuando no hay disputa - Flex centrado con 2 botones */
            <>
              {/* Ver Historial */}
              {user && (
                <div className="relative rounded-lg p-1 cursor-pointer overflow-hidden bg-primary/30 border border-primary/40 shadow-sm z-5 w-24">
                  <div className="relative z-5">
                    <ViewHistoryButton orderId={order.id} />
                  </div>
                </div>
              )}

              {/* Copiar ID */}
              {user && (
                <div className="relative rounded-lg p-1 cursor-pointer overflow-hidden bg-secondary/30 border border-secondary/40 shadow-sm z-5 w-24">
                  <div className="relative z-5">
                    <CopyIdButton orderId={order.id} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
