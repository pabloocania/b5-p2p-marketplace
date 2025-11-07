"use client";

import { useEffect, useMemo, useState } from "react";
import { Order, OrderOffer, PaymentMethod } from "b5-api-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { p2pMarketAPIClient } from "@/lib/APIClients";
import { useKioscoinUserContext } from "../../users/KioscoinUserContext";
import PaymentMethodSelector from "../create-orders/PaymentMethodSelector";
import { ConfigStore } from "@/lib/ConfigStore";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import LockFundsButton from "@/components/web3/Escrow/LockFundsButton";
import OperationOrderDetails from "./OperationOrderDetails";
import OperationBalanceSection from "./OperationBalanceSection";
import { CreditCard, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import Address from "@/components/web3/Transfers/Address";

interface OperationFormProps {
  offer: OrderOffer;
  onCancel: () => void;
  onLockFundsSuccess: () => void; // only used for SELL after lock funds
  onOrderCreated: () => void;
}

export default function OperationForm({
  offer,
  onCancel,
  onLockFundsSuccess,
  onOrderCreated,
}: OperationFormProps) {
  const { t } = useTranslation();
  const { user, loginId } = useKioscoinUserContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const { balances, swAddress } = useEtherspotSdk();
  const [buyerAddress, setBuyerAddress] = useState(swAddress || "");
  const availableMethods = ConfigStore.getInstance().getPaymentMethods();
  const [order, setOrder] = useState<Order | null>(null);

  const isSell = offer.type === "SELL";

  // Initialize selected methods from user's saved settings (same behavior as UserSettings)
  useEffect(() => {
    const saved = user?.settings?.paymentMethods;
    if (Array.isArray(saved)) {
      setSelectedMethods(saved);
    } else {
      setSelectedMethods([]);
    }
  }, [user?.id, user?.settings?.paymentMethods]);

  const isValid = useMemo(() => {
    const hasValidMethod = selectedMethods.some(
      (m) => (m.entity?.trim()?.length ?? 0) > 0
    );
    if (isSell) {
      // SELL flow must also ensure seller has a non-empty balance check in API; here just method presence
      return hasValidMethod;
    }
    // BUY flow requires destination address + method
    return buyerAddress.trim().length > 0 && hasValidMethod;
  }, [selectedMethods, buyerAddress, isSell]);

  const handlePointOfSale = async () => {
    setIsSubmitting(true);
    try {
      const requestBody: any = {
        offer: {
          id: offer.id,
          type: offer.type,
          tokenAmount: offer.tokenAmount,
          exchangeMethods: selectedMethods,
          tokenCode: offer.tokenCode,
          blockchain: offer.blockchain,
          fiatCode: offer.fiatCode,
          fiatAmount: offer.fiatAmount,
          title: offer.title,
          actionButtonDescription: offer.actionButtonDescription,
          exchangeRateOfferId: (offer as any).exchangeRateOfferId,
        },
      };
      if (!isSell) {
        requestBody.buyerAddress = buyerAddress;
      } else {
        requestBody.paymentMethods = selectedMethods;
      }

      const response = await p2pMarketAPIClient.pointOfSaleTransact(
        requestBody,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginId}`,
        }
      );

      if (isSell) {
        if (response.order) {
          setOrder(response.order);
          onOrderCreated?.();
        }
      } else {
        onOrderCreated?.();
        onCancel();
      }
    } catch (e: any) {
      toast({
        title: t("request_failed"),
        description: e?.message ?? t("unexpected_error"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSell = async () => {
    if (order) {
      try {
        await p2pMarketAPIClient.updateOrder(
          { orderId: order?.id || "", status: "CANCELED" },
          {
            "Content-Type": "application/json",
            Authorization: `Bearer ${loginId}`,
          }
        );
      } catch {}
    }
    onCancel();
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 w-full justify-center">
          <span className="text-2xl text-dark font-bold font-secondary w-full text-center">
            {isSell ? t("sell") : t("buy")} {offer.tokenCode}
          </span>
        </div>
      </div>

      <OperationBalanceSection
        balances={balances}
        onTokenSelect={() => {}}
        handleTransfer={() => {}}
        hideEmptyBalances={true}
      />

      {/* Order Details */}
      <OperationOrderDetails
        offer={offer}
        mainLineKey={isSell ? "you_will_receive" : "you_must_pay"}
      />

      {/* BUY: Destination Address */}
      {!isSell && (
        <div className="space-y-2">
          <Label
            htmlFor="orderDetails"
            className="font-secondary text-dark flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            {t("destination_address")}
          </Label>
          <div className="rounded-lg mb-2 p-2 pt-0 bg-white border border-secondary/20 shadow-md">
            <Address
              address={buyerAddress}
              isOperation={true}
              showLabel={false}
            />
          </div>
        </div>
      )}

      <Label
        htmlFor="userBalance"
        className="font-secondary text-dark flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        {t("payment_method")}
      </Label>
      {/* Payment Method Selector */}
      <PaymentMethodSelector
        selectedMethods={selectedMethods}
        onChange={setSelectedMethods}
        methods={availableMethods}
        readOnly={!isSell}
      />

      {/* Actions */}
      {isSell ? (
        order ? (
          <div>
            <LockFundsButton
              order={order}
              canLock={!!isValid}
              onSuccess={onLockFundsSuccess || onCancel}
            />
          </div>
        ) : (
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePointOfSale}
              disabled={!isValid || isSubmitting}
              className="w-full bg-secondary text-white font-secondary hover:bg-white/80 hover:text-secondary"
            >
              {isSubmitting ? t("sending") : t("continue")}
            </Button>
          </div>
        )
      ) : (
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handlePointOfSale}
            disabled={!isValid || isSubmitting}
            className="w-full bg-secondary text-white font-secondary hover:bg-white/80 hover:text-secondary"
          >
            {isSubmitting ? t("sending") : t("continue")}
          </Button>
        </div>
      )}

      <div className="">
        <Button
          variant="outline"
          onClick={isSell ? handleCancelSell : onCancel}
          disabled={isSubmitting}
          className="w-full bg-white text-secondary font-secondary border border-secondary/80 hover:bg-secondary/10"
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
