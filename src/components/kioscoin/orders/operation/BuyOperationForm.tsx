"use client";

import { useMemo, useState } from "react";
import { OrderOffer, PaymentMethod } from "b5-api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { p2pMarketAPIClient } from "@/lib/APIClients";
import { useUserContext } from "../../users/UserContext";
import PaymentMethodSelector from "../create-orders/PaymentMethodSelector";
import { ConfigStore, getBlockchainDisplayName } from "@/lib/ConfigStore";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import { Wallet, CreditCard, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BuyOperationFormProps {
  offer: OrderOffer;
  onCancel: () => void;
}

export function BuyOperationForm({ offer, onCancel }: BuyOperationFormProps) {
  const { t } = useTranslation();
  const { user, loginId } = useUserContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const { swAddress } = useEtherspotSdk();
  const [buyerAddress, setBuyerAddress] = useState(swAddress || "");
  const availableMethods = ConfigStore.getInstance().getPaymentMethods();

  const isValid = useMemo(() => {
    const hasValidMethod = selectedMethods.some(
      (m) => (m.entity?.trim()?.length ?? 0) > 0
    );
    return buyerAddress.trim().length > 0 && hasValidMethod;
  }, [buyerAddress, selectedMethods]);

  const handleSubmit = async () => {
    if (!isValid || !user) return;
    setIsSubmitting(true);
    try {
      const body = {
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
        buyerAddress: buyerAddress,
      };

      const response = await p2pMarketAPIClient.pointOfSaleTransact(body, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginId}`,
      });

      toast({
        title: t("request_sent"),
        description: t("offer_match_shortly"),
      });
      onCancel();
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span
            className="text-2xl font-semibold"
            style={{ color: "#6b7280 !important" }}
          >
            {offer.type === "SELL" ? t("sell") : t("buy")} {offer.tokenCode}
          </span>
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-3">
        <Label
          htmlFor="orderDetails"
          className="font-secondary !text-gray-800 flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          {t("order_details")}
        </Label>
        <div className="rounded-lg px-5 py-4 bg-white border border-gray-200">
          <div className="rounded-lg space-y-3 px-4 py-3 bg-yellow-50 border border-yellow-200">
            <div className="space-y-1">
              <p className="text-sm text-primary font-secondary">
                {t("you_will_pay")}{" "}
                <strong className="!text-gray-800">
                  {offer.fiatCode} {offer.fiatAmount}
                </strong>
              </p>
              <p className="text-sm text-primary font-secondary">
                {t("for")}{" "}
                <strong className="!text-gray-800">
                  {offer.tokenAmount} {offer.tokenCode}
                </strong>
              </p>
            </div>
            <p className="text-xs text-gray-400 font-secondary">
              {t("blockchain")}: {getBlockchainDisplayName(offer.blockchain)}
            </p>
          </div>
        </div>
      </div>

      {/* Destination Address */}
      <div className="space-y-3">
        <Label
          htmlFor="buyerAddress"
          className="font-secondary !text-gray-800 flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          {t("destination_address")}
        </Label>
        <Input
          id="buyerAddress"
          placeholder="0x..."
          value={buyerAddress}
          onChange={(e) => setBuyerAddress(e.target.value)}
          className="font-secondary [&::placeholder]:font-secondary !text-gray-500"
        />
      </div>

      {/* Payment Method Selector */}
      <PaymentMethodSelector
        selectedMethods={selectedMethods}
        onChange={setSelectedMethods}
        methods={availableMethods}
        readOnly={true} // Set to readOnly mode
      />

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="font-secondary !text-gray-500"
        >
          {t("cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="bg-primary text-white font-secondary hover:bg-primary/80"
        >
          {isSubmitting ? t("sending") : t("continue")}
        </Button>
      </div>
    </div>
  );
}
