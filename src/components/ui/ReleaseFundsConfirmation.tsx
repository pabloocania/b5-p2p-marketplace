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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Order } from "b5-api-client/dist/types";
import { OPSReceipt } from "@/lib/web3/types";
import { Separator } from "./separator";
import { useTranslation } from "react-i18next";

type WalletType = "eoa" | "smart";

interface ReleaseFundsConfirmationProps {
  order: Order;
  isLoading: boolean;
  handleReleaseFunds: () => Promise<OPSReceipt | undefined | null>;
  onClose: () => void;
}

export default function ReleaseFundsConfirmation({
  order,
  isLoading,
  handleReleaseFunds,
  onClose,
}: ReleaseFundsConfirmationProps) {
  const [walletType, setWalletType] = useState<WalletType>("smart");
  const { t } = useTranslation();

  const fees = {
    eoa: {
      gas: 2,
    },
    smart: {
      gas: 0,
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleConfirm = async () => {
    handleReleaseFunds();
    onClose();
  };

  const renderGasFee = () => {
    return (
      <div className="space-y-3 text-sm bg-secondary bg-opacity-10 p-2 rounded-md">
        <p>
          <span className="font-semibold text-primary font-semibold">
            {t("network_gas_fee")}
          </span>
          <span className="font-semibold text-terciary">
            {fees[walletType].gas + " tRBTC"}
          </span>
          {walletType === "smart" && (
            <span className="ml-1 text-green-600 font-semibold">
              <span className="ml-2 bg-secondary font-semibold text-white px-2 py-0.5 text-xs rounded-full">
                {t("gasless")}
              </span>
            </span>
          )}
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
          <Alert className="mb-6 bg-yellow-100 border border-yellow-100">
            <AlertTriangle className="h-4 w-4 font-bold" />
            <AlertTitle className="text-primary font-bold">
              {t("warning")}
            </AlertTitle>
            <AlertDescription className="text-terciary">
              {t("warning_release_text")}
            </AlertDescription>
          </Alert>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="wallet-type"
                  className="text-base text-primary font-bold"
                >
                  {walletType === "smart"
                    ? "Use Smart Wallet"
                    : "Use EOA Wallet"}
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
                  ? "Gasless transactions, only pay service fee."
                  : "Pay both transaction and gas fees."}
              </p>
            </div>
            <div className="space-y-2 text-sm">{renderGasFee()}</div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between pb-3">
          <Button
            onClick={handleConfirm}
            className="w-full text-white bg-secondary"
            disabled={isLoading}
          >
            {t("release_funds")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
