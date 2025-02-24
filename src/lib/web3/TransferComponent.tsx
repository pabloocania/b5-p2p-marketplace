import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight } from "lucide-react";
import { TokenBalance } from "./types";
import { useTranslation } from "react-i18next";

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

  // Ensure hooks are called unconditionally
  useEffect(() => {
    if (selectedToken) {
      const balance = isEOA
        ? selectedToken.eoaBalance
        : selectedToken.smartWalletBalance;
      setTransferAmount(balance);
    }
  }, [selectedToken, isEOA]);

  const handleTransferAmount = () => {
    handleTransfer(transferAmount);
  };

  const isDisabled = () => {
    if (!selectedToken) return true;
    const balance = isEOA
      ? parseFloat(selectedToken.eoaBalance)
      : parseFloat(selectedToken.smartWalletBalance);
    return balance < 0;
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
    <div className="space-y-2">
      <p className="text-xs text-center text-primary">
        {t("enter_transfer_amount")}
      </p>
      <div className="flex items-center space-x-2">
        <Label htmlFor="transfer-amount" className="sr-only">
          {t("transfer_amount")}
        </Label>
        <Input
          id="transfer-amount"
          type="number"
          placeholder="Amount"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={handleMaxAmount} variant="outline" size="sm">
          Max
        </Button>
      </div>
      <Button
        onClick={handleTransferAmount}
        className="w-full bg-secondary text-white"
      >
        <ArrowLeftRight className="mr-2 h-4 w-4" />
        {t("transfer")}
      </Button>
    </div>
  );
};

export default TransferAmountInput;
