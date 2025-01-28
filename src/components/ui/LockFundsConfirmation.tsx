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
import { Switch } from "@/components/ui/switch";
import { Order } from "b5-api-client/dist/types";
import { OPSReceipt } from "@/lib/web3/types";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

type WalletType = "eoa" | "smart";

interface LockFundsConfirmationProps {
  order: Order;
  canLock: boolean;
  handleLockFunds: () => Promise<OPSReceipt | undefined>;
  onClose: () => void;
}

export default function LockFundsConfirmation({
  order,
  canLock,
  handleLockFunds,
  onClose,
}: LockFundsConfirmationProps) {
  const { t } = useTranslation();
  const [walletType, setWalletType] = useState<WalletType>("smart");
  const orderAmount = parseFloat(order.amount ?? "0");
  const orderFee = parseFloat(order.fee ?? "0");

  const fees = {
    eoa: {
      transaction: orderFee,
      gas: 2,
    },
    smart: {
      transaction: orderFee,
      gas: 0,
    },
  };

  const totalAmount =
    orderAmount + fees[walletType].transaction + fees[walletType].gas;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleConfirm = async () => {
    handleLockFunds();
    onClose();
  };

  const renderGasFee = () => {
    return (
      <p>
        {t("network_gas_fee") + fees[walletType].gas + " tRBTC"}
        {walletType === "smart" && (
          <span className="ml-2 text-green-600 font-semibold">
            {t("gasless")}!
          </span>
        )}
      </p>
    );
  };

  const renderOrderDetails = () => {
    return (
      <div className="space-y-2 text-sm">
        <p>
          {t("amount")}: {orderAmount + " " + order.tokenCode}
        </p>
        <p>
          {t("transaction_fee")}:{" "}
          {fees[walletType].transaction + " " + order.tokenCode}
        </p>
        {renderGasFee()}
        <p className="font-semibold text-base mt-2">
          Total: {totalAmount + " " + order.tokenCode}
        </p>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center pt-8">
      <Card className="w-full max-w-md border border-primary">
        <CardHeader className="flex justify-center items-center">
          <CardTitle className="text-center text-primary">
            {t("transaction_details")}
          </CardTitle>
        </CardHeader>
        <Separator className="my-2"></Separator>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="wallet-type" className="text-base font-medium">
                  {walletType === "smart" ? t("use_sw") : t("use_eoa")}
                </Label>
                <Switch
                  id="wallet-type"
                  checked={walletType === "smart"}
                  onCheckedChange={(checked) =>
                    setWalletType(checked ? "smart" : "eoa")
                  }
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {walletType === "smart"
                  ? t("sw_fee_details")
                  : t("eoa_fee_details")}
              </p>
            </div>
            {renderOrderDetails()}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
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
