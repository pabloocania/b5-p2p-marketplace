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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Order } from "b5-api-client/dist/types";
import { OPSReceipt } from "@/components/web3/types";
import { Separator } from "../../../components/ui/separator";
import { useTranslation } from "react-i18next";

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
  const walletType = "smart";
  const { t } = useTranslation();

  const fees = {
    gas: 0,
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
          <span className="font-secondary text-primary">
            {t("network_gas_fee")}
          </span>
          <span className="font-semibold text-dark">
            {fees.gas + " " + order.tokenCode}
          </span>
          <span className="ml-1 text-green-600 font-semibold">
            <span className="ml-2 bg-primary font-semibold text-white px-2 py-0.5 text-xs rounded-full">
              {t("gasless")}
            </span>
          </span>
        </p>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-center pt-6 font-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="flex justify-center items-center pt-4">
          <CardTitle className="text-center text-dark">
            {t("release_funds")}
          </CardTitle>
        </CardHeader>
        <Separator className="my-2"></Separator>
        <CardContent className="p-3">
          <Alert className="bg-primary/10 border border-primary/50">
            <AlertTriangle className="h-4 w-4 font-bold" />
            <AlertTitle className="text-primary font-bold">
              {t("warning")}
            </AlertTitle>
            <AlertDescription className="text-primary font-secondary">
              {t("warning_release_text")}
            </AlertDescription>
          </Alert>
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* <div className="space-y-3">
              <p className="text-xs text-gray-500 mt-1 font-secondary text-center">
                {t("sw_fee_details")}
              </p>
            </div> */}
            {/* <div className="space-y-2 text-sm">{renderGasFee()}</div> */}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between pb-2">
          <Button
            onClick={handleConfirm}
            className="w-full text-white bg-secondary"
            disabled={isLoading}
          >
            {t("release_funds")}
            <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
