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
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Order } from "b5-api-client/dist/types";
import { OPSReceipt } from "@/lib/web3/types";
import { Separator } from "./separator";
import { useTranslation } from "react-i18next";

type WalletType = "eoa" | "smart";

interface ReleaseFundsConfirmationProps {
  order: Order;
  isLoading: boolean;
  handleReleaseFunds: () => Promise<OPSReceipt | undefined>;
  onClose: () => void;
}

export default function ReleaseFundsConfirmation({
  order,
  isLoading,
  handleReleaseFunds,
  onClose,
}: ReleaseFundsConfirmationProps) {
  const [walletType, setWalletType] = useState<WalletType>("smart");
  const [step, setStep] = useState<"select" | "confirm">("select");
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
    setStep("confirm");
  };

  const handleConfirm = async () => {
    handleReleaseFunds();
    onClose();
  };

  const handleCancel = () => {
    if (step === "confirm") {
      setStep("select");
    } else {
      onClose();
    }
  };

  const renderGasFee = () => {
    return (
      <p>
        {t("network_gas_fee") + fees[walletType].gas + " tRBTC"}
        {walletType === "smart" && (
          <span className="ml-1 text-green-600 font-semibold">
            {t("gasless")}!
          </span>
        )}
      </p>
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
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t("warning")}</AlertTitle>
            <AlertDescription>{t("warning_release_text")}</AlertDescription>
          </Alert>
          {step === "select" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="wallet-type"
                    className="text-base font-medium"
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
              <Button type="submit" className="w-full text-white">
                {t("continue")}
                <ArrowRight className="ml-2" />
              </Button>
            </form>
          ) : (
            <div className="space-y-2 text-sm">
              <p>
                Wallet: {walletType === "eoa" ? "EOA Wallet" : "Smart Wallet"}
              </p>
              {renderGasFee()}
            </div>
          )}
        </CardContent>
        {step === "confirm" && (
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCancel}>
              {t("back")}
            </Button>
            <Button
              onClick={handleConfirm}
              className="text-white bg-secondary"
              disabled={isLoading}
            >
              {t("release_funds")}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
