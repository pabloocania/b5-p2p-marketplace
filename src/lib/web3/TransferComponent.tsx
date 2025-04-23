import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeftRight, ArrowRight, InfoIcon } from "lucide-react";
import { TokenBalance, TokenTransfer } from "./types";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TransferAmountInputProps {
  selectedToken: TokenBalance | null;
  handleTransfer: (transferAmount: string) => void;
  isEOA: boolean;
}

const TransferAmountInput: React.FC<TransferAmountInputProps> = ({
  selectedToken,
  handleTransfer,
  isEOA,
}) => {
  const { t } = useTranslation();
  const [transferAmount, setTransferAmount] = useState("");
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  // Ensure hooks are called unconditionally
  useEffect(() => {
    if (selectedToken) {
      setTransferAmount("");
      estimateGasFee();
    }
  }, [selectedToken, isEOA]);

  // Simulate gas fee estimation
  const estimateGasFee = async () => {
    if (!selectedToken) return;

    setIsEstimating(true);
    try {
      // In a real implementation, this would call a blockchain API
      // For now, we're simulating with a timeout
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock gas estimate value - in a real app, this would come from a provider
      const mockGasPrice = "0.000012";
      setGasEstimate(mockGasPrice);
    } catch (error) {
      console.error("Error estimating gas:", error);
      setGasEstimate(null);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleTransferAmount = () => {
    if (!selectedToken || !transferAmount) return;

    handleTransfer(transferAmount);

    // Reset form after transfer
    setTransferAmount("");
  };

  const isDisabled = () => {
    if (!selectedToken) return true;

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) return true;

    const balance = isEOA
      ? parseFloat(selectedToken.eoaBalance)
      : parseFloat(selectedToken.smartWalletBalance);

    return amount > balance || isEstimating;
  };

  const handleMaxAmount = () => {
    if (selectedToken) {
      const maxAmount = isEOA
        ? selectedToken.eoaBalance
        : selectedToken.smartWalletBalance;
      setTransferAmount(maxAmount.toString());
    }
  };

  // Render null if no token is selected
  if (!selectedToken) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center">
        {/* <p className="text-sm font-medium text-primary">
          {t("transfer_direction")}
        </p> */}
        <div className="flex items-center bg-secondary bg-opacity-5 rounded-lg px-3 py-1">
          <span className="text-xs font-medium text-primary">
            {isEOA ? "EOA Wallet" : "Smart Wallet"}
          </span>
          <ArrowRight className="mx-2 h-3 w-3 text-secondary" />
          <span className="text-xs font-medium text-primary">
            {isEOA ? "Smart Wallet" : "EOA Wallet"}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {/* <Label htmlFor="transfer-amount" className="text-xs text-primary">
            Wh
          </Label> */}
          <span className="text-xs text-primary">
            {t("available")}:{" "}
            {isEOA
              ? parseFloat(selectedToken.eoaBalance).toFixed(6)
              : parseFloat(selectedToken.smartWalletBalance).toFixed(6)}{" "}
            {selectedToken.name}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            id="transfer-amount"
            type="number"
            placeholder="0.00"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleMaxAmount} variant="outline" size="sm">
            Max
          </Button>
        </div>

        {gasEstimate && isEOA && (
          <div className="flex items-center justify-between text-xs text-primary">
            <span className="flex items-center">
              {t("estimated_gas_fee")}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="ml-1 h-3 w-3 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("gas_fee_explanation")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span>{gasEstimate} ETH</span>
          </div>
        )}
      </div>

      <Button
        onClick={handleTransferAmount}
        className="w-full bg-secondary text-white"
        disabled={isDisabled()}
      >
        <ArrowLeftRight className="mr-2 h-4 w-4" />
        {isEstimating ? t("estimating_gas") : t("transfer")}
      </Button>

      {isEOA && (
        <div className="text-xs text-center text-primary font-bold">
          {t("smart_wallet_benefits")}
        </div>
      )}
    </div>
  );
};

export default TransferAmountInput;
