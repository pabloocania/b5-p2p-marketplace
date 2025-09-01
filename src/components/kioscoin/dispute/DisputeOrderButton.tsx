"use client";
import { useState } from "react";
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

import { Order } from "b5-api-client";
import { p2pMarketAPIClient as client } from "@/lib/APIClients";
import { useUserContext } from "@/components/kioscoin/users/UserContext";
import { CreateDisputeRequest } from "b5-api-client";

// interface DisputeOrderRequest {
//   orderId: string;
//   reason: string;
// }

interface DisputeOrderButtonProps {
  order: Order;
}

export default function DisputeOrderButton({ order }: DisputeOrderButtonProps) {
  const { user, loginId } = useUserContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const { t } = useTranslation();

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;

  const canBuyerDispute = isBuyer && order.buyerCanDispute;
  const canSellerDispute = isSeller && order.sellerCanDispute;

  const buyerDisputed = isBuyer && order.buyerDisputed;
  const sellerDisputed = isSeller && order.sellerDisputed;
  const alreadyDisputed = buyerDisputed || sellerDisputed;

  const canShowDisputeButton =
    (canBuyerDispute || canSellerDispute) && !alreadyDisputed;

  function getDisputeReason(
    order: Order
  ): "SELLER_NOT_RELEASING" | "BUYER_FIAT_NOT_SENT" | "SELLER_NOT_LOCKING" {
    if (canBuyerDispute && order.status === "FIAT_SENT") {
      return "SELLER_NOT_RELEASING";
    }
    if (canSellerDispute && order.status === "ACTIVE") {
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
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-2 w-full"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-xs font-medium text-red-600 text-center font-secondary">
              {t("order_disputed")}
            </span>
          </button>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dispute_already_title")}</DialogTitle>
            </DialogHeader>
            <div className="text-red-600 text-center py-4">
              {t("dispute_already_message")}
            </div>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" onClick={handleClose}>
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
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-2 w-full"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-xs font-medium text-gray-500 text-center font-secondary">
            {t("dispute_order")}
          </span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {apiResult
                ? t("dispute_success_title")
                : apiError
                ? t("error")
                : t("dispute_confirm_title")}
            </DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="animate-spin w-8 h-8 mb-2 text-red-600" />
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
              <div className="bg-muted p-3 rounded-md mt-2 text-sm">
                <p>
                  <strong>ID:</strong> {order.id}
                </p>
                <p>
                  <strong>{t("status")} </strong> {order.status}
                </p>
                <p>
                  <strong>{t("amount")} </strong> {order.amount}{" "}
                  {order.tokenCode}
                </p>
                <p>
                  <strong>{t("dispute_reason")}:</strong> {disputeReason}
                </p>
              </div>
              <p className="mt-4">{t("dispute_confirm_message")}</p>
            </>
          )}

          <DialogFooter className="flex justify-end gap-2 mt-4">
            {!loading && (apiResult || apiError) ? (
              <Button variant="default" onClick={handleClose}>
                {t("dispute_button_close")}
              </Button>
            ) : (
              <>
                <Button
                  variant="default"
                  onClick={handleClose}
                  disabled={loading}
                >
                  {t("dispute_button_no")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={onConfirmDispute}
                  disabled={loading}
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
