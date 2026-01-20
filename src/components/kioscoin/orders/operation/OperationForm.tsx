"use client";

import { useEffect, useMemo, useState } from "react";
import { Order, OrderOffer, PaymentMethod } from "b5-api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { p2pMarketAPIClient } from "@/lib/APIClients";
import { useKioscoinUserContext } from "../../users/KioscoinUserContext";
import { ConfigStore } from "@/lib/ConfigStore";
import { useKioscoinWallet } from "@/components/web3/AccountAbstraction/KioscoinWalletProvider";
import LockFundsButton from "@/components/web3/Escrow/LockFundsButton";
import OperationBalanceSection from "./OperationBalanceSection";
import { useTranslation } from "react-i18next";
import { Copy, Check } from "lucide-react";
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
  const { balances, swAddress } = useKioscoinWallet();
  const [buyerAddress, setBuyerAddress] = useState(swAddress || "");
  const [copied, setCopied] = useState(false);
  const availableMethods = ConfigStore.getInstance().getPaymentMethods();
  const [order, setOrder] = useState<Order | null>(null);

  // Keep buyerAddress in sync with swAddress
  useEffect(() => {
    if (swAddress) {
      setBuyerAddress(swAddress);
    }
  }, [swAddress]);

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

  const handleFiatMethodSelect = (method: PaymentMethod) => {
    setSelectedMethods([method]);
  };

  return (
    <div className="space-y-3 p-2">
      {/* Header */}
      <div className="flex flex-col justify-center items-center gap-1 pb-3">
        <span className="text-lg text-primary font-medium font-secondary">
          {isSell ? t("sell") : t("buy")}
        </span>
        <CryptoAmountIcon
          formattedAmount={offer.tokenAmount}
          tokenCode={offer.tokenCode}
          showAmount={true}
          textSizeClass="text-2xl"
          amountTextClassName="text-dark font-bold"
          iconSize="md"
        />
      </div>
      {/* Hide balance, operation details and payment method when order is created */}
      {isSell && !order && (
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

      {/* Hide operation details card when order is created for SELL */}
      {!(isSell && order) && (
        <Card className="w-full border shadow-md border-secondary/20 rounded-md">
          <CardContent className="px-4 py-3 space-y-2 font-secondary">
            <div className="space-y-1">
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
      )}

      {/* Payment method selector - hide when order is created for SELL */}
      {isSell && !order && (
        <FiatSendReceiveMethodSelector
          availableMethods={availableMethods}
          userMethods={user?.settings?.paymentMethods ?? []}
          selectedMethod={selectedMethods[0] ?? null}
          onMethodSelect={handleFiatMethodSelect}
          fiatCode={offer.fiatCode}
        />
      )}

      {/* BUY flow: show fiat send method selector and address */}
      {!isSell && (
        <>
          <FiatSendMethodSelector
            availableMethods={availableMethods}
            userMethods={user?.settings?.paymentMethods ?? []}
            selectedMethod={selectedMethods[0] ?? null}
            onMethodSelect={handleFiatMethodSelect}
            fiatCode={offer.fiatCode}
            requireAlias={false}
          />
          <Card className="w-full border shadow-md border-secondary/20 rounded-md">
            <CardContent className="px-4 py-3 space-y-2 font-secondary">
              <span className="text-sm text-primary font-secondary">
                {t("your_address_receive_funds")}
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-dark font-mono truncate flex-1">
                  {buyerAddress}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(buyerAddress);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-1.5 rounded-md hover:bg-secondary/10 transition-colors"
                  title={t("copy")}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-secondary" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Action Buttons */}
      {isSell ? (
        order ? (
          <div className="space-y-3">
            {/* Order Summary */}
            <Card className="w-full border shadow-md border-secondary/20 rounded-md">
              <CardContent className="px-4 py-3 space-y-2 font-secondary">
                <div className="space-y-1">
                  {/* Token amount */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark font-bold">
                      {t("you_will_sell")}
                    </span>
                    <CryptoAmountIcon
                      formattedAmount={order.amount ?? ""}
                      tokenCode={order.tokenCode ?? ""}
                      showAmount={true}
                      textSizeClass="text-sm"
                      amountTextClassName="text-dark font-bold"
                      iconSize="sm"
                    />
                  </div>
                  {/* Fiat amount */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark font-bold">
                      {t("you_will_receive")}
                    </span>
                    <span className="text-sm font-bold text-dark font-secondary">
                      {formatFiatAmount(
                        order.fiatAmount ?? "0",
                        order.fiatCode ?? "ARS"
                      )}
                    </span>
                  </div>
                  {/* Payment method */}
                  {order.paymentMethods && order.paymentMethods.length > 0 && (
                    <div className="flex flex-col pt-1 gap-1">
                      <span className="text-sm text-dark font-bold">
                        {t("payment_method")}
                      </span>
                      <div className="flex flex-col gap-1">
                        {order.paymentMethods.map((method, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm font-secondary bg-terciary/20 rounded-md py-1 px-1"
                          >
                            <span className="text-dark font-medium">
                              {method.entity}
                            </span>
                            {method.alias && (
                              <span className="text-xs text-dark bg-secondary/50 px-1.5 py-0.5 rounded truncate max-w-[180px]">
                                @{method.alias}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Buyer/Seller username */}
                  {(order.buyerUsername || order.sellerUsername) && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm text-dark font-bold">
                        {order.type === "SELL" ? t("buyer") : t("seller")}
                      </span>
                      <span className="text-sm text-dark font-secondary">
                        @
                        {order.type === "SELL"
                          ? order.buyerUsername
                          : order.sellerUsername}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Lock Funds Button */}
            <LockFundsButton
              order={order}
              canLock={!!isValid}
              onSuccess={onLockFundsSuccess || onCancel}
            />
            {/* Close Button */}
            <Button
              variant="outline"
              onClick={onCancel}
              className="font-secondary w-full items-center gap-2 text-xs border-primary text-dark hover:bg-terciary"
            >
              {t("close")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handlePointOfSale}
              disabled={!isValid || isSubmitting}
              className="font-secondary w-full items-center gap-2 text-xs border-primary text-white hover:bg-terciary hover:text-primary"
            >
              {isSubmitting ? t("sending") : t("continue")}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="font-secondary w-full items-center gap-2 text-xs border-primary text-dark hover:bg-terciary"
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
            className="font-secondary w-full items-center gap-2 text-xs border-primary text-white hover:bg-terciary hover:text-primary"
          >
            {isSubmitting ? t("sending") : t("continue")}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="font-secondary w-full items-center gap-2 text-xs border-primary text-dark hover:bg-terciary"
          >
            {t("cancel")}
          </Button>
        </div>
      )}
    </div>
  );
}
