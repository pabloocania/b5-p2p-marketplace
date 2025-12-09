"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client/dist/types";
import { OPSReceipt } from "@/components/web3/types";
import { Separator } from "@/components/ui/separator";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleConfirm = async () => {
    handleLockFunds();
    onClose();
  };

  const renderOrderDetails = () => {
    const tokenCode = order.tokenCode?.toLowerCase() ?? "";

    return (
      <div className="space-y-3 text-sm bg-secondary/10 p-3 rounded-md">
        <div className="flex items-center justify-between">
          <span className="text-base text-primary font-secondary font-bold">
            {t("amount_to_deposit")}:
          </span>
          <CryptoAmountIcon
            formattedAmount={totalAmount.toString()}
            tokenCode={tokenCode}
            textSizeClass="text-lg text-dark"
            iconSize="md"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-primary font-secondary">{t("amount")}:</span>
          <CryptoAmountIcon
            formattedAmount={orderAmount.toString()}
            tokenCode={tokenCode}
            textSizeClass="text-sm text-dark"
            iconSize="sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-primary font-secondary">
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
    );
  };

  return (
    <div className="flex justify-center items-center pt-6 font-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="flex justify-center items-center pt-4">
          <CardTitle className="text-center text-dark font-secondary">
            {t("lock_funds")}
          </CardTitle>
        </CardHeader>
        <Separator className="my-2"></Separator>
        <CardContent className="py-2 px-4">
          <p className="text-sm text-dark font-secondary w-full text-center mb-2">
            {t("deposit_funds")}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderOrderDetails()}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between pb-3">
          <Button
            className="w-full text-white bg-secondary"
            onClick={handleConfirm}
            disabled={canLock}
          >
            {t("lock_funds")}
            <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
