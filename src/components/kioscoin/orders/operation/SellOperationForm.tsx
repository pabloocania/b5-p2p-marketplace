"use client";

import { useMemo, useState } from "react";
import { Order, OrderOffer, PaymentMethod, OrderStatus } from "b5-api-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { p2pMarketAPIClient } from "@/lib/APIClients";
import { useUserContext } from "../../users/UserContext";
import PaymentMethodSelector from "../create-orders/PaymentMethodSelector";
import { ConfigStore } from "@/lib/ConfigStore";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import LockFundsButton from "@/components/web3/Escrow/LockFundsButton";
import { transformBannerOfferToOrderRequest } from "../../banner/utils";
import { BannerOffer } from "../../banner/types";
import { Label } from "@/components/ui/label";
import TokenBalanceCardList from "../../TokenBalancesCardsList";
import { Wallet, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SellOperationFormProps {
  offer: OrderOffer;
  onCancel: () => void;
  onLockFundsSuccess: () => void;
}

export function SellOperationForm({
  offer,
  onCancel,
  onLockFundsSuccess,
}: SellOperationFormProps) {
  const { t } = useTranslation();
  const { user, loginId } = useUserContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const { balances, swAddress } = useEtherspotSdk();
  const availableMethods = ConfigStore.getInstance().getPaymentMethods();
  const [order, setOrder] = useState<Order | null>(null);

  // Find the balance for the selected token
  const selectedTokenBalance = balances.find(
    (balance) => balance.name === offer.tokenCode
  );

  const isValid = useMemo(() => {
    const hasValidMethod = selectedMethods.some(
      (m) => (m.entity?.trim()?.length ?? 0) > 0
    );
    const hasSufficientBalance =
      selectedTokenBalance &&
      parseFloat(selectedTokenBalance.smartWalletBalance) >=
        parseFloat(offer.tokenAmount);
    return hasSufficientBalance && hasValidMethod;
  }, [selectedTokenBalance, selectedMethods, offer.tokenAmount]);

  const handleLockFunds = async () => {
    setIsSubmitting(true);
    const body = {
      offer: {
        id: offer.id,
        type: offer.type,
        tokenAmount: offer.tokenAmount,
        exchangeMethods: selectedMethods, // Ensure this is part of the offer
        tokenCode: offer.tokenCode,
        blockchain: offer.blockchain,
        fiatCode: offer.fiatCode,
        fiatAmount: offer.fiatAmount,
        title: offer.title,
        actionButtonDescription: offer.actionButtonDescription,
        exchangeRateOfferId: (offer as any).exchangeRateOfferId,
      },
      paymentMethods: selectedMethods, // Include payment methods in the request
    };

    try {
      const response = await p2pMarketAPIClient.pointOfSaleTransact(body, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginId}`,
      });

      if (response.order) {
        setOrder(response.order);
      } else if (response.error) {
        // Handle error if needed
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

  const handleCancel = async () => {
    if (order) {
      const updateRequest = {
        orderId: order?.id || "", // Ensure orderId is a string
        status: "CANCELED",
      };
      try {
        await p2pMarketAPIClient.updateOrder(updateRequest, {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginId}`,
        });
      } catch (e: any) {
        // Handle error if needed
      }
    }
    onCancel();
  };

  const bannerOffer: BannerOffer = {
    ...offer,
    action: "", // Provide default or actual values
    amount: offer.tokenAmount, // Assuming tokenAmount corresponds to amount
    fiatCode: offer.fiatCode as "ARS" | "EUR", // Ensure fiatCode is of the correct type
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

      {/* Offer Details */}
      <div className="rounded-lg space-y-3 px-5 py-4 bg-secondary bg-opacity-10">
        <p className="text-sm text-primary font-secondary">
          {t("you_will_receive")}{" "}
          <strong className="!text-gray-800">
            {offer.fiatCode} {offer.fiatAmount}
          </strong>{" "}
          {t("for")}{" "}
          <strong className="!text-gray-800">
            {offer.tokenAmount} {offer.tokenCode}
          </strong>
        </p>
        <p className="text-sm text-primary font-secondary">
          {t("blockchain")}:{" "}
          <strong className="!text-gray-800">{offer.blockchain}</strong>
        </p>
      </div>

      {/* Balance Label */}
      <div className="space-y-3">
        <Label
          htmlFor="userBalance"
          className="font-secondary !text-gray-800 flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          {t("your_balance")}
        </Label>
        {/* Display User Balances */}
        <TokenBalanceCardList
          balances={balances}
          balanceType="sw"
          onTokenSelect={(token) => {
            // Handle token selection if needed
          }}
          handleTransfer={(transferAmount) => {
            // Handle transfer if needed
          }}
          hideEmptyBalances={true} // Hide zero balances
        />
      </div>

      {order ? (
        <div>
          <LockFundsButton
            order={order}
            canLock={!!isValid}
            onSuccess={onLockFundsSuccess}
          />
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="font-secondary !text-gray-500"
          >
            {t("cancel")}
          </Button>
        </div>
      ) : (
        <>
          {/* Payment Method Selector */}
          <PaymentMethodSelector
            selectedMethods={selectedMethods}
            onChange={setSelectedMethods}
            methods={availableMethods}
            readOnly={false}
          />
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleLockFunds}
              disabled={!isValid || isSubmitting}
              className="bg-primary text-white font-secondary hover:bg-primary/80"
            >
              {isSubmitting ? t("sending") : t("continue")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
