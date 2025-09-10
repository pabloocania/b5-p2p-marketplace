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
import { ConfigStore } from "@/lib/ConfigStore";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";

interface BuyOperationFormProps {
  offer: OrderOffer;
  onCancel: () => void;
}

export function BuyOperationForm({ offer, onCancel }: BuyOperationFormProps) {
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
        title: "Request sent",
        description: "We'll match your offer shortly",
      });
      onCancel();
    } catch (e: any) {
      toast({
        title: "Failed to send request",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-semibold">
            {offer.type === "SELL" ? "Sell" : "Buy"} {offer.tokenCode}
          </span>
        </div>
      </div>

      {/* Offer Details */}
      <div className="rounded-lg space-y-2 px-4 py-3 bg-secondary bg-opacity-10">
        <p className="text-sm text-primary font-secondary">
          You will pay{" "}
          <strong>
            {offer.fiatCode} {offer.fiatAmount}
          </strong>{" "}
          for{" "}
          <strong>
            {offer.tokenAmount} {offer.tokenCode}
          </strong>
        </p>
        <p className="text-sm text-primary font-secondary">
          Blockchain: <strong>{offer.blockchain}</strong>
        </p>
      </div>

      {/* Destination Address */}
      <div className="space-y-2">
        <Label htmlFor="buyerAddress" className="font-secondary">
          Destination address
        </Label>
        <Input
          id="buyerAddress"
          placeholder="0x..."
          value={buyerAddress}
          onChange={(e) => setBuyerAddress(e.target.value)}
          className="font-secondary [&::placeholder]:font-secondary"
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
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Sending..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
