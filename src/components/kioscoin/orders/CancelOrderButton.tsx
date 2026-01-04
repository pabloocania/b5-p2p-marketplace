import React, { useState } from "react";
import { Order } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";
import { CancelOrderGuardSheet } from "./CancelOrderGuardSheet";
import { p2pMarketAPIClient as client } from "../../../lib/APIClients";
import { useKioscoinUserContext } from "../users/KioscoinUserContext";
import { IconButton } from "@/components/ui/IconButton";

interface CancelOrderButtonProps {
  order: Order;
  onCancelled?: () => void;
}

export function CancelOrderButton({
  order,
  onCancelled,
}: CancelOrderButtonProps) {
  const { t } = useTranslation();
  const { user, loginId } = useKioscoinUserContext();
  const [isGuardOpen, setIsGuardOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCreator = user?.id === order.creatorId;
  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;

  const isPending = order.status === "PENDING";
  const isWaitingPayment = order.status === "WAITING_PAYMENT";

  // User can cancel if:
  // 1. User is creator AND status is PENDING
  // 2. Status is WAITING_PAYMENT AND user is creator, buyer, or seller
  const canCancel =
    (isCreator && isPending) ||
    (isWaitingPayment && (isCreator || isBuyer || isSeller));

  if (!canCancel) {
    return null;
  }

  const handleConfirmCancel = async () => {
    if (!order.id) return;

    setLoading(true);
    try {
      await client.cancelOrder(order.id, {
        Authorization: `Bearer ${loginId}`,
      });
      setIsGuardOpen(false);
      onCancelled?.();
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <IconButton
        icon={XCircle}
        className="font-secondary border-primary/50 bg-white text-primary hover:bg-secondary/20 w-full justify-center"
        label={t("cancel_order", "Cancelar")}
        variant="outline"
        size="sm"
        onClick={() => setIsGuardOpen(true)}
      />
      <CancelOrderGuardSheet
        open={isGuardOpen}
        onOpenChange={setIsGuardOpen}
        onConfirm={handleConfirmCancel}
        loading={loading}
      />
    </div>
  );
}

