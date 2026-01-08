"use client";

import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client/dist/types";
import { OPSReceipt } from "@/components/web3/types";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { CryptoAmountIcon } from "@/components/kioscoin/CryptoIcon";

interface LockFundsConfirmationProps {
  order: Order;
  canLock: boolean;
  handleLockFunds: () => Promise<OPSReceipt | undefined | null>;
  onClose: () => void;
}

export default function LockFundsConfirmation({
  order,
  canLock,
  handleLockFunds,
  onClose,
}: LockFundsConfirmationProps) {
  const { t } = useTranslation();
  const orderAmount = parseFloat(order.amount ?? "0");
  const orderFee = parseFloat(order.fee ?? "0");

  const fees = {
    transaction: orderFee,
    gas: 0,
  };

  const totalAmount = orderAmount + fees.transaction + fees.gas;

  const handleConfirm = async () => {
    handleLockFunds();
    onClose();
  };

  const tokenCode = order.tokenCode?.toLowerCase() ?? "";

  return (
    <div className="w-full max-w-md mx-auto px-2 font-secondary">
      <div className="rounded-lg border border-gray-300/70 bg-white/80 shadow-sm p-3">
        <div className="space-y-2 mt-2 mb-4">
          <h2 className="text-dark text-base sm:text-lg text-center leading-tight font-semibold">
            {t("lock_funds")}
          </h2>
          <p className="text-center font-secondary text-dark text-xs">
            {t("deposit_funds")}
          </p>
        </div>

        <div className="mb-4 flex justify-center">
          <div className="w-full text-sm space-y-2 p-3 rounded-md border border-secondary/20 bg-white/60 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("amount_to_deposit")}:
              </span>
              <CryptoAmountIcon
                formattedAmount={totalAmount.toString()}
                tokenCode={tokenCode}
                textSizeClass="text-sm text-dark font-bold"
                iconSize="sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("amount")}:</span>
              <CryptoAmountIcon
                formattedAmount={orderAmount.toString()}
                tokenCode={tokenCode}
                textSizeClass="text-sm text-dark"
                iconSize="sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("transaction_fee")}:
              </span>
              <CryptoAmountIcon
                formattedAmount={fees.transaction.toString()}
                tokenCode={tokenCode}
                textSizeClass="text-sm text-dark"
                iconSize="sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button
            className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-md shadow-sm h-11 min-h-[44px]"
            onClick={handleConfirm}
            disabled={canLock}
          >
            {t("lock_funds")}
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
