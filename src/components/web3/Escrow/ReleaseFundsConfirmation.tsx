"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Order } from "b5-api-client/dist/types";
import { OPSReceipt } from "@/components/web3/types";
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
  const { t } = useTranslation();

  const handleConfirm = async () => {
    handleReleaseFunds();
    onClose();
  };

  return (
    <div className="w-full max-w-md mx-auto px-2 font-secondary">
      <div className="rounded-lg border border-gray-300/70 bg-white/80 shadow-sm p-3">
        <div className="space-y-2 mt-2 mb-4">
          <h2 className="text-dark text-base sm:text-lg text-center leading-tight font-semibold">
            {t("release_funds")}
          </h2>
        </div>

        <div className="mb-4">
          <Alert className="border border-primary/30 bg-primary/5">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary text-sm font-semibold">
              {t("warning")}
            </AlertTitle>
            <AlertDescription className="text-primary/80 font-secondary text-xs">
              {t("warning_release_text")}
            </AlertDescription>
          </Alert>
        </div>

        <div className="mt-4">
          <Button
            onClick={handleConfirm}
            className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-md shadow-sm h-11 min-h-[44px]"
            disabled={isLoading}
          >
            {t("release_funds")}
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
