import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";
import { TransactionStatusResponse } from "b5-api-client";
import { PublicClientManager } from "./PublicClientManager";
import { useChainId } from "wagmi";

export const useTransactionHandler = (
  setTransaction: (transaction: any) => void,
  t: (key: string) => string,
  checkTransactionStatus: (
    transactionHash: string,
    chainId: number
  ) => Promise<TransactionStatusResponse>
) => {
  const { transferFromSmartWalletToEOA, transferFromEOAToSW } =
    useEtherspotFlow();
  const chainId = useChainId();

  const handleTransaction = async (
    transactionType: "EOAToSW" | "EtherspotToEOA",
    selectedCoinAddress: string,
    transferAmount: string
  ) => {
    try {
      setTransaction({
        status: transactionType === "EOAToSW" ? "sent" : "waiting",
        message: t(
          transactionType === "EOAToSW"
            ? "initiating_transaction"
            : "transfering"
        ),
        progress: transactionType === "EOAToSW" ? 25 : 10,
      });

      if (transactionType === "EOAToSW") {
        const transactionHash = await transferFromEOAToSW(
          selectedCoinAddress,
          transferAmount
        );
        await checkTransactionStatus(transactionHash, chainId);
      } else {
        const receipt = await transferFromSmartWalletToEOA(
          selectedCoinAddress,
          transferAmount,
          chainId
        );
        console.log(receipt);
        if (receipt.success) {
          setTransaction({
            status: "success",
            message: t("transaction_success"),
            progress: 10,
          });
        } else {
          setTransaction({
            status: "error",
            message: t("transaction_failed"),
            progress: 10,
          });
        }
      }
    } catch (error) {
      setTransaction({
        status: "error",
        message: t("transaction_failed"),
        progress: 0,
      });
      console.error(`Error transferring tokens:`, error);
    }
  };

  return { handleTransaction };
};
