import { useTranslation } from "react-i18next";
import { useTransaction } from "./web3/Transactions/TransactionContext";
import { p2pMarketAPIClient } from "@/lib/APIClients";
import { TransactionStatusResponse } from "b5-api-client";
import { BlockchainMapper } from "./web3/PublicClientManager";

export const useTransactionStatusChecker = () => {
  const { t } = useTranslation();
  const { setTransaction } = useTransaction();

  const checkTransactionStatus = async (
    transactionHash: string,
    chainId: number
  ): Promise<TransactionStatusResponse> => {
    const pollInterval = 5000; // Poll every 5 seconds
    const timeout = Date.now() + 300000; // 5 minute timeout

    while (Date.now() < timeout) {
      try {
        const response = await p2pMarketAPIClient.getTransactionStatus(
          transactionHash,
          {
            "x-blockchain":
              BlockchainMapper.getBlockchainNameByChainId(chainId),
          }
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
        } else return Promise.reject(new Error("Transaction failed"));
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

  return { checkTransactionStatus };
};
