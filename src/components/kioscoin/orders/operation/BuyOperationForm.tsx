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
      (m) =>
        ((m.alias?.trim()?.length ?? 0) > 0 ||
          (m.cbu?.trim()?.length ?? 0) > 0) &&
        (m.entity?.trim()?.length ?? 0) > 0
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

      await p2pMarketAPIClient.pointOfSaleTransact(body, {
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
      <div>
        <h3 className="text-lg font-semibold">Buy {offer.tokenCode}</h3>
        <p className="text-sm text-muted-foreground">
          You will pay {offer.fiatCode} {offer.fiatAmount} for{" "}
          {offer.tokenAmount} {offer.tokenCode}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="buyerAddress">Destination address</Label>
        <Input
          id="buyerAddress"
          placeholder="0x..."
          value={buyerAddress}
          onChange={(e) => setBuyerAddress(e.target.value)}
        />
      </div>

      <PaymentMethodSelector
        selectedMethods={selectedMethods}
        onChange={setSelectedMethods}
        methods={availableMethods}
      />

      {/* <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Input
            id="alias"
            placeholder="your.alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Input
            id="cbu"
            placeholder="XXXXXXXXXXXXXXX"
            value={cbu}
            onChange={(e) => setCbu(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Input
          id="entity"
          placeholder="Bank/Fintech name"
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
        />
      </div> */}
      {/* 
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name (optional)</Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div> */}

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
