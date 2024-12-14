import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client";
import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";
import { useTransaction } from "./TransactionContext";

interface ReleaseFundsButtonProps {
  order: Order;
  onRefresh?: () => void;
  canRelease: boolean;
}

const ReleaseFundsButton: React.FC<ReleaseFundsButtonProps> = ({
  order,
  onRefresh,
  canRelease,
}) => {
  const [isTransacting, setIsTransacting] = useState(false);
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const { releaseFunds } = useEtherspotFlow(); // Import the lockFunds function from the hook
  const { setTransaction } = useTransaction();

  const handleReleaseFunds = async () => {
    if (!isTransacting) {
      setIsLoading(true);
      try {
        setIsTransacting(true);
        const opsReceiptPromise = releaseFunds(order);
        setTransaction({
          status: "idle",
          message: t("initiating_transaction"),
          progress: 0,
        });
        setTimeout(() => {
          setTransaction({
            status: "waiting",
            message: t("releasing_funds"),
            progress: 45,
          });
        }, 500);

        try {
          const opsReceipt = await opsReceiptPromise;
          if (opsReceipt != undefined && opsReceipt.success) {
            setTransaction({
              status: "success",
              message: t("funds_released"),
              progress: 100,
              order: order,
            });
          } else {
            setTransaction({
              status: "error",
              message: t("transaction_failed"),
              progress: 0,
            });
          }
          return opsReceipt;
        } catch (error) {
          setTransaction({
            status: "error",
            message: t("transaction_failed"),
            progress: 0,
          });
        } finally {
          setIsTransacting(true);
        }
      } catch (error) {
        console.error("Error locking funds:", error);
        // Handle error here (e.g., show an error message to the user)
      } finally {
        setIsLoading(false);
      }
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  return canRelease && isConnected ? (
    <Button
      className="w-full bg-yellow-500 text-white"
      onClick={handleReleaseFunds}
      disabled={isLoading}
    >
      {t("release_funds")}
    </Button>
  ) : null;
};

export default ReleaseFundsButton;
