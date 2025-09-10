"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client/dist/types";
import { OPSReceipt } from "@/components/web3/types";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

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
  const walletType = "smart";
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
    return (
      <div className="space-y-3 text-sm bg-secondary bg-opacity-10 p-2 rounded-md">
        <p className="text-primary font-secondary">
          {t("amount_to_deposit")}:{" "}
          <span className="font-semibold text-dark">
            {orderAmount + " " + order.tokenCode}
          </span>
        </p>
        <p className="text-primary font-secondary">
          {t("transaction_fee")}:{" "}
          <span className="font-semibold text-dark">
            {fees.transaction + " " + order.tokenCode}
          </span>
        </p>
        <p className="text-primary font-secondary">
          {t("network_gas_fee")}
          <span className="font-semibold text-dark">
            {fees.gas + " " + order.tokenCode}
          </span>
          <span className="ml-2 bg-primary font-secondary text-white px-2 py-0.5 text-xs rounded-full">
            {t("gasless")}
          </span>
        </p>
        <p className="text-base mt-2 text-primary font-secondary">
          <span className="font-semibold text-primary text-xl">Total: </span>
          <span className="font-semibold text-dark text-xl">
            {totalAmount + " " + order.tokenCode}
          </span>
        </p>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center pt-6">
      <Card className="w-full max-w-md">
        <CardHeader className="flex justify-center items-center pt-4">
          <CardTitle className="text-center text-primary">
            {t("transaction_details")}
          </CardTitle>
        </CardHeader>
        <Separator className="my-2"></Separator>
        <CardContent className="py-4 px-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <p className="text-xs text-gray-500 mt-1 font-secondary text-center">
                {t("sw_fee_details")}
              </p>
            </div>
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
