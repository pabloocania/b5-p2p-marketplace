"use client";

import { useEffect, useMemo, useState } from "react";
import { Order, OrderOffer, PaymentMethod } from "b5-api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { p2pMarketAPIClient } from "@/lib/APIClients";
import { useKioscoinUserContext } from "../../users/KioscoinUserContext";
import { ConfigStore } from "@/lib/ConfigStore";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import LockFundsButton from "@/components/web3/Escrow/LockFundsButton";
import OperationBalanceSection from "./OperationBalanceSection";
import { useTranslation } from "react-i18next";
import AddressInput from "../AddressInput";
import FiatSendReceiveMethodSelector from "../FiatReceiveMethodSelector";
import FiatSendMethodSelector from "../FiatSendMethodSelector";
import { CryptoAmountIcon } from "../../CryptoIcon";
import { formatFiatAmount } from "@/lib/utils";
import { getBlockchainDisplayName, BlockchainName } from "@/lib/ConfigStore";

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
    if (isSell) {
      // SELL offer (isSell): API requires paymentMethods
      return selectedMethods.some(
        (m) =>
          (m.entity?.trim()?.length ?? 0) > 0 &&
          (m.alias?.trim()?.length ?? 0) > 0
      );
    }
    // BUY offer (!isSell): API requires buyerAddress + valid fiat receive method
    const firstMethod = selectedMethods[0];
    return (
      buyerAddress.trim().length > 0 &&
      firstMethod !== undefined &&
      firstMethod.alias !== undefined &&
      firstMethod.alias.trim().length > 0
    );
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
        className: "font-secondary",
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

  const handleFiatMethodSelect = (method: PaymentMethod) => {
    setSelectedMethods([method]);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-center items-center">
        <span className="text-2xl text-dark font-bold font-secondary">
          {isSell ? t("sell") : t("buy")} {offer.tokenCode}
        </span>
      </div>
      {isSell && (
        <>
          {/* Balance Section */}
          <OperationBalanceSection
            balances={balances}
            onTokenSelect={() => {}}
            handleTransfer={() => {}}
            hideEmptyBalances={true}
          />
        </>
      )}

      <Card className="w-full bg-primary/10 border-primary/40 border shadow-md rounded-md">
        <CardContent className="px-4 py-3 space-y-2 font-secondary">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="text-sm text-primary font-secondary">
                {isSell ? t("you_will_receive") : t("you_must_pay")}
              </span>
              <span className="text-sm font-bold text-dark font-secondary">
                {formatFiatAmount(offer.fiatAmount, offer.fiatCode)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-primary font-secondary">
                {t("for")}
              </span>
              <CryptoAmountIcon
                formattedAmount={offer.tokenAmount}
                tokenCode={offer.tokenCode?.toLowerCase()!!}
                textSizeClass="text-sm text-dark font-bold"
                amountTextClassName="font-bold"
                iconSize="sm"
              />
            </div>
            {/* Blockchain */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-primary font-secondary">
                {t("on")}
              </span>
              <span className="text-xs font-medium text-dark font-secondary">
                {getBlockchainDisplayName(offer.blockchain as BlockchainName)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      {isSell ? (
        <>
          <FiatSendReceiveMethodSelector
            availableMethods={availableMethods}
            userMethods={user?.settings?.paymentMethods ?? []}
            selectedMethod={selectedMethods[0] ?? null}
            onMethodSelect={handleFiatMethodSelect}
            fiatCode={offer.fiatCode}
          />
        </>
      ) : (
        <>
          <AddressInput
            walletAddress={buyerAddress}
            setWalletAddress={setBuyerAddress}
            orderStatus="PENDING"
          />
          <FiatSendMethodSelector
            availableMethods={availableMethods}
            userMethods={user?.settings?.paymentMethods ?? []}
            selectedMethod={selectedMethods[0] ?? null}
            onMethodSelect={handleFiatMethodSelect}
            fiatCode={offer.fiatCode}
            requireAlias={false}
          />
        </>
      )}

      {/* Action Buttons */}
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
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handlePointOfSale}
              disabled={!isValid || isSubmitting}
              className="w-full bg-secondary text-white font-secondary hover:bg-secondary/90 text-sm font-semibold shadow-none"
            >
              {isSubmitting ? t("sending") : t("continue")}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full bg-white text-secondary font-secondary border border-secondary/80 hover:bg-secondary/10 text-sm"
            >
              {t("cancel")}
            </Button>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handlePointOfSale}
            disabled={!isValid || isSubmitting}
            className="w-full bg-secondary text-white font-secondary hover:bg-secondary/90 text-sm font-semibold shadow-none"
          >
            {isSubmitting ? t("sending") : t("continue")}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full bg-white text-secondary font-secondary border border-secondary/80 hover:bg-secondary/10 text-sm"
          >
            {t("cancel")}
          </Button>
        </div>
      )}
    </div>
  );
}
