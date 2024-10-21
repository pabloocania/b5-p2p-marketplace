"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionStatus } from "./TransactionStatus";
import { useTransactionStatus } from "@/hooks/useTransactionStatus";

// Simulated transaction function
const simulateTransaction = async (
  updateStatus: (status: string, message: string, progress: number) => void
) => {
  updateStatus("sent", "Initiating transaction...", 0);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  updateStatus("waiting", "Processing payment...", 25);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  updateStatus("waiting", "Confirming with the bank...", 50);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  updateStatus("waiting", "Finalizing transaction...", 75);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  updateStatus("success", "Transaction completed successfully!", 100);
};

export default function TransactionDemo() {
  const { transactionState, updateTransactionStatus, resetTransactionStatus } =
    useTransactionStatus();
  const [isTransacting, setIsTransacting] = useState(false);

  const handleTransaction = async () => {
    setIsTransacting(true);
    try {
      await simulateTransaction((status, message, progress) => {
        updateTransactionStatus(status as any, message, progress);
      });
    } catch (error) {
      updateTransactionStatus(
        "error",
        "Transaction failed. Please try again.",
        0
      );
    } finally {
      setIsTransacting(false);
    }
  };

  const handleClose = () => {
    resetTransactionStatus();
  };

  return (
    <div className="p-4 space-y-4">
      <Button onClick={handleTransaction} disabled={isTransacting}>
        {isTransacting ? "Processing..." : "Start Transaction"}
      </Button>
      <Button
        onClick={resetTransactionStatus}
        variant="outline"
        disabled={isTransacting}
      >
        Reset
      </Button>

      <TransactionStatus
        status={transactionState.status}
        message={transactionState.message}
        progress={transactionState.progress}
        onClose={handleClose}
      />
    </div>
  );
}
