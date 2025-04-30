import { p2pMarketAPIClient } from "@/lib/APIClients";
import { TransactionStatusResponse } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { useTransaction } from "@/lib/web3/Transactions/TransactionContext";

export const checkTransactionStatus = async (
  transactionHash: string
): Promise<TransactionStatusResponse> => {
  const { t } = useTranslation();
  const pollInterval = 5000; // Poll every 5 seconds
  const timeout = Date.now() + 300000; // 5 minute timeout
  const { setTransaction } = useTransaction();

  while (Date.now() < timeout) {
    try {
      const response = await p2pMarketAPIClient.getTransactionStatus(
        transactionHash
      );

      if (response.status === "SUCCESSFULL") {
        setTransaction({
          status: "success",
          message: t("transaction_success"),
          progress: 100,
        });
        return response;
      } else if (response.status === "FAILED") {
        setTransaction({
          status: "error",
          message: t("transaction_failed"),
          progress: 0,
        });
        return Promise.reject(new Error("Transaction failed"));
      } else if (response.status === "PENDING") {
        setTransaction({
          status: "waiting",
          message: t("transaction_pending"),
          progress: 50,
        });
      }
      await new Promise<void>((resolve) => setTimeout(resolve, pollInterval));
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error("Transaction not found:", error);
        setTransaction({
          status: "error",
          message: t("transaction_not_found"),
          progress: 0,
        });
      } else {
        console.error("Error fetching transaction status:", error);
        setTransaction({
          status: "error",
          message: t("transaction_status_error"),
          progress: 0,
        });
      }
    }
  }

  // If the loop exits due to timeout
  setTransaction({
    status: "error",
    message: t("transaction_status_timeout"),
    progress: 0,
  });
  return Promise.reject(new Error("Transaction status check timed out"));
};
