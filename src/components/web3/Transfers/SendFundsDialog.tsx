import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isAddress, parseUnits } from "viem";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TokenBalance } from "@/components/web3/types";
import { PublicClientManager } from "@/components/web3/PublicClientManager";
import { useEtherspotFlow } from "@/components/web3/AccountAbstraction/useEtherspotFlow";
import { useTransaction } from "@/components/web3/Transactions/TransactionContext";
import { sleep } from "@etherspot/prime-sdk/dist/sdk/common";
import { p2pMarketAPIClient } from "@/lib/APIClients";

interface SendFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances: TokenBalance[];
  currentBlockchain: string;
  onRefreshBalances?: () => void;
}

type TransactionStatus = "idle" | "confirming" | "success" | "failed";

interface FormState {
  destinationAddress: string;
  selectedToken: string;
  amount: string;
  transactionStatus: TransactionStatus;
  txHash: string;
  error: string;
}

const SendFundsDialog: React.FC<SendFundsDialogProps> = ({
  open,
  onOpenChange,
  balances,
  currentBlockchain,
  onRefreshBalances,
}) => {
  const { t } = useTranslation();
  const { transferTokens, getUserOperationReceipt } = useEtherspotFlow();
  const { setTransaction } = useTransaction();

  const [formState, setFormState] = useState<FormState>({
    destinationAddress: "",
    selectedToken: "",
    amount: "",
    transactionStatus: "idle",
    txHash: "",
    error: "",
  });

  // Filter tokens with balance > 0
  const availableTokens = balances.filter(
    (token) => parseFloat(token.smartWalletBalance) > 0
  );

  // Get selected token details
  const selectedTokenBalance = balances.find(
    (b) => b.name === formState.selectedToken
  );

  // Format balance for display
  const formatBalance = (balance: string, decimals: number): string => {
    try {
      const balanceNumber = parseFloat(balance);
      const formattedBalance = balanceNumber / Math.pow(10, decimals);
      return formattedBalance.toFixed(6);
    } catch (error) {
      return "0.00";
    }
  };

  const getMaxBalance = (): string => {
    if (!selectedTokenBalance) return "0";
    return formatBalance(
      selectedTokenBalance.smartWalletBalance,
      selectedTokenBalance.decimals
    );
  };

  const validateAddress = (address: string): boolean => {
    return isAddress(address);
  };

  const validateAmount = (amount: string): boolean => {
    try {
      const amountNum = parseFloat(amount);
      const maxBalance = parseFloat(getMaxBalance());
      return amountNum > 0 && amountNum <= maxBalance;
    } catch {
      return false;
    }
  };

  const handleSend = () => {
    // Reset error
    setFormState((prev) => ({ ...prev, error: "" }));

    // Validate address
    if (!validateAddress(formState.destinationAddress)) {
      setFormState((prev) => ({
        ...prev,
        error: t("invalid_address") || "Invalid address",
      }));
      return;
    }

    // Validate token selection
    if (!formState.selectedToken || !selectedTokenBalance) {
      setFormState((prev) => ({
        ...prev,
        error: t("select_token") || "Please select a token",
      }));
      return;
    }

    // Validate amount
    if (!validateAmount(formState.amount)) {
      setFormState((prev) => ({
        ...prev,
        error: t("invalid_amount") || "Invalid amount or insufficient balance",
      }));
      return;
    }

    // Store transaction details before closing dialog
    const transactionDetails = {
      tokenAddress: selectedTokenBalance.address,
      destinationAddress: formState.destinationAddress,
      amount: parseUnits(
        formState.amount,
        selectedTokenBalance.decimals
      ).toString(),
      chainId: PublicClientManager.getChainIdForBlockchain(currentBlockchain),
      tokenDecimals: selectedTokenBalance.decimals,
    };

    // Close dialog immediately
    onOpenChange(false);

    // Execute transaction in background
    executeTransfer(transactionDetails);
  };

  const executeTransfer = async (details: {
    tokenAddress: string;
    destinationAddress: string;
    amount: string;
    chainId: number | undefined;
    tokenDecimals: number;
  }) => {
    try {
      if (!details.chainId) {
        throw new Error("Unable to determine chain ID");
      }

      // Set initial transaction status
      setTransaction({
        status: "waiting",
        message: t("preparing_transaction") || "Preparing transaction",
        progress: 25,
      });

      // Execute transfer
      const userOpHash = await transferTokens(
        details.tokenAddress,
        details.destinationAddress,
        details.amount,
        details.chainId
      );

      if (userOpHash) {
        console.log("Transaction sent, userOpHash:", userOpHash);

        setTransaction({
          status: "sending",
          message:
            t("sending_tx_blockchain") ||
            "Sending transaction to blockchain...",
          progress: 50,
        });

        // Wait for transaction confirmation using same pattern as LockFundsButton
        let opsReceipt = null;
        const timeout = Date.now() + 300000; // 5 minute timeout

        while (opsReceipt == null && Date.now() < timeout) {
          await sleep(2); // Sleep 5 seconds between attempts
          opsReceipt = await getUserOperationReceipt(userOpHash);
          console.log("opsReceipt", opsReceipt);
        }

        if (opsReceipt != undefined && opsReceipt.success) {
          // Fire-and-forget: log the operation receipt to the backend
          p2pMarketAPIClient
            .saveOpsLog({
              chainId: PublicClientManager.getChainIdForBlockchain(
                currentBlockchain ?? "RSK_TESTNET"
              ),
              userOp: opsReceipt as unknown as Record<string, unknown>,
              opsType: "TRANSFER",
            })
            .catch((error: any) => {
              console.error("Error saving ops log:", error);
            });

          console.log("Transaction confirmed successfully");

          setTransaction({
            status: "success",
            message: t("transaction_success") || "Transaction successful!",
            progress: 100,
          });

          // Trigger balance refresh after successful transaction
          if (onRefreshBalances) {
            onRefreshBalances();
          }
        } else {
          throw new Error("Transaction confirmation failed or timed out");
        }
      } else {
        throw new Error("Transaction failed to submit");
      }
    } catch (error) {
      console.error("Error sending funds:", error);

      setTransaction({
        status: "error",
        message:
          t("transaction_failed") || "Transaction failed. Please try again.",
        progress: 0,
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSetMax = () => {
    if (selectedTokenBalance) {
      setFormState((prev) => ({ ...prev, amount: getMaxBalance() }));
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormState({
        destinationAddress: "",
        selectedToken: "",
        amount: "",
        transactionStatus: "idle",
        txHash: "",
        error: "",
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-primary text-primary">
            {t("send_funds") || "Send Funds"}
          </DialogTitle>
          <DialogDescription className="font-secondary text-xs text-dark pt-1">
            {t("send_funds_description") ||
              "Send your balance to an external address in Kioscoin."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {/* Destination Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="font-secondary text-dark">
              {t("destination_address_to") || "Destination address"}
            </Label>
            <Input
              id="address"
              placeholder="0x..."
              value={formState.destinationAddress}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  destinationAddress: e.target.value,
                }))
              }
              disabled={false}
              className="font-secondary border border-secondary"
            />
          </div>

          {/* Token Selection */}
          <div className="space-y-2">
            <Label htmlFor="token" className="font-secondary text-dark">
              {t("select_token") || "Select Token"}
            </Label>
            <Select
              value={formState.selectedToken}
              onValueChange={(value) =>
                setFormState((prev) => ({
                  ...prev,
                  selectedToken: value,
                  amount: "",
                }))
              }
              disabled={false}
            >
              <SelectTrigger className="font-secondary border border-secondary">
                <SelectValue
                  placeholder={t("select_token") || "Select a token"}
                />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token) => (
                  <SelectItem
                    key={token.name}
                    value={token.name}
                    className="font-secondary"
                  >
                    {token.name} (
                    {formatBalance(token.smartWalletBalance, token.decimals)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="amount" className="font-secondary text-dark">
                {t("amount") || "Amount"}
              </Label>
              {selectedTokenBalance && (
                <span className="text-xs font-secondary text-muted-foreground">
                  {t("balance") || "Balance"}: {getMaxBalance()}{" "}
                  {selectedTokenBalance.name}
                </span>
              )}
            </div>
            <div className="flex">
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0.00"
                value={formState.amount}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, amount: e.target.value }))
                }
                disabled={!formState.selectedToken}
                className="font-secondary border border-secondary"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSetMax}
                disabled={!formState.selectedToken}
                className="ml-2 font-secondary hover:border-secondary hover:bg-secondary/10 text-dark text-xs"
              >
                {t("max") || "MAX"}
              </Button>
            </div>
          </div>

          {/* Error Message - Only validation errors shown */}
          {formState.error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md font-secondary">
              {formState.error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full bg-white text-secondary font-secondary border border-secondary/80 hover:bg-secondary/10"
          >
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            onClick={handleSend}
            disabled={
              !formState.destinationAddress ||
              !formState.selectedToken ||
              !formState.amount
            }
            className="w-full bg-secondary text-white font-secondary hover:bg-dark"
          >
            {t("send") || "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendFundsDialog;
