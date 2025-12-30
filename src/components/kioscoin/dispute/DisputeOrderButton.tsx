"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/components/ui/IconButton";

import { Order } from "b5-api-client";
import { p2pMarketAPIClient as client } from "@/lib/APIClients";
import { useKioscoinUserContext } from "@/components/kioscoin/users/KioscoinUserContext";
import { CreateDisputeRequest } from "b5-api-client";

// interface DisputeOrderRequest {
//   orderId: string;
//   reason: string;
// }

interface DisputeOrderButtonProps {
  order: Order;
  onDisputeCreated?: () => void;
}

export default function DisputeOrderButton({
  order,
  onDisputeCreated,
}: DisputeOrderButtonProps) {
  const { user, loginId } = useKioscoinUserContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const { t } = useTranslation();

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;

  const canBuyerDispute: boolean = isBuyer && (order?.buyerCanDispute ?? false);
  const canSellerDispute: boolean =
    isSeller && (order?.sellerCanDispute ?? false);

  const buyerDisputed: boolean = isBuyer && (order?.buyerDisputed ?? false);
  const sellerDisputed: boolean = isSeller && (order?.sellerDisputed ?? false);
  const initialAlreadyDisputed: boolean = buyerDisputed || sellerDisputed;
  const [localDisputed, setLocalDisputed] = useState<boolean>(
    initialAlreadyDisputed
  );

  const alreadyDisputed = useMemo(
    () => localDisputed || initialAlreadyDisputed,
    [localDisputed, initialAlreadyDisputed]
  );

  const canShowDisputeButton =
    (canBuyerDispute || canSellerDispute) && !alreadyDisputed;

  function getDisputeReason(
    order: Order
  ): "SELLER_NOT_RELEASING" | "BUYER_FIAT_NOT_SENT" | "SELLER_NOT_LOCKING" {
    if (canBuyerDispute && order.status === "FIAT_SENT") {
      return "SELLER_NOT_RELEASING";
    }
    if (
      canSellerDispute &&
      (order.status === "ACTIVE" || order.status === "FIAT_SENT")
    ) {
      return "BUYER_FIAT_NOT_SENT";
    }
    return "SELLER_NOT_LOCKING";
  }

  const onConfirmDispute = async () => {
    setLoading(true);
    setApiResult(null);
    setApiError(null);

    const reason = getDisputeReason(order);

    try {
      const request: CreateDisputeRequest = {
        orderId: order.id ?? "",
        reason: reason,
        creatorId: user?.id ?? "",
      };

      const headers = {
        Authorization: `Bearer ${loginId}`,
      };

      const response = await client.createDispute(request, headers);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setApiResult("✅ Disputa creada con éxito.");
      // Optimistic local switch to disputed state to prevent repeated creation
      setLocalDisputed(true);
      // Notify parent to refresh order state if provided
      if (onDisputeCreated) {
        onDisputeCreated();
      }
    } catch (err) {
      setApiError("❌ No se pudo iniciar la disputa. Intentalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setApiResult(null);
    setApiError(null);
  };

  const disputeReason = getDisputeReason(order);

  if (alreadyDisputed) {
    return (
      <>
        <div className="flex flex-col items-center w-full">
          <IconButton
            icon={AlertCircle}
            iconClassName="font-secondary border-primary/50 bg-white text-primary hover:bg-secondary/20"
            label={t("order_disputed")}
            variant="outline"
            className="w-full justify-center"
            size="sm"
            onClick={() => setOpen(true)}
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="font-secondary">
            <DialogHeader className="px-4 py-3">
              <DialogTitle className="font-secondary text-dark font-semibold">
                {t("dispute_already_title")}
              </DialogTitle>
            </DialogHeader>
            <div className="font-secondary">
              <div className="p-3 rounded-md mt-2 text-sm bg-secondary/10 border border-secondary/30 text-dark text-center">
                {t("dispute_already_message")}
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {t("dispute_button_close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (!canShowDisputeButton) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col items-center w-full">
        <IconButton
          icon={AlertCircle}
          className="font-secondary border-primary/50 bg-white text-primary hover:bg-secondary/20 w-full justify-center"
          label={t("dispute_order")}
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="font-secondary">
          <DialogHeader className="px-4 py-3">
            <DialogTitle className="text-dark font-semibold">
              {apiResult
                ? t("dispute_success_title")
                : apiError
                ? t("error")
                : t("dispute_confirm_title")}
            </DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="animate-spin w-8 h-8 mb-2 text-primary" />
              <span>{t("sending")}</span>
            </div>
          )}

          {!loading && apiResult && (
            <div className="text-green-600 text-center py-4">
              {t("dispute_success_message")}
            </div>
          )}
          {!loading && apiError && (
            <div className="text-red-600 text-center py-4">{apiError}</div>
          )}

          {!loading && !apiResult && !apiError && (
            <>
              <div className="p-3 rounded-md mt-2 text-sm bg-secondary/10 border border-secondary/30">
                <p>
                  <strong>ID:</strong> {order.id}
                </p>
                <p>
                  <strong>{t("status")} </strong>{" "}
                  {t(`statuses.${order.status ?? ""}`, {
                    defaultValue: order.status,
                  })}
                </p>
                <p>
                  <strong>{t("amount")} </strong> {order.amount}{" "}
                  {order.tokenCode}
                </p>
                <p>
                  <strong>{t("dispute_reason")}:</strong>{" "}
                  {t(`dispute_reasons.${disputeReason}`, {
                    defaultValue: disputeReason,
                  })}
                </p>
              </div>
              <p className="mt-4">{t("dispute_confirm_message")}</p>
            </>
          )}

          <DialogFooter className="flex justify-end gap-2 mt-4">
            {!loading && (apiResult || apiError) ? (
              <Button
                variant="default"
                onClick={handleClose}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {t("dispute_button_close")}
              </Button>
            ) : (
              <>
                <Button
                  variant="default"
                  onClick={handleClose}
                  disabled={loading}
                  className="font-secondary bg-primary text-white hover:bg-primary/90"
                >
                  {t("dispute_button_no")}
                </Button>
                <Button
                  variant="default"
                  onClick={onConfirmDispute}
                  disabled={loading}
                  className="font-secondary bg-primary text-white hover:bg-primary/90"
                >
                  {loading ? t("sending") : t("dispute_button_yes")}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
