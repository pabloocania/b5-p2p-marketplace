import { useEtherspotFlow } from "@/components/web3/AccountAbstraction/useEtherspotFlow";
import { TransactionStatusResponse } from "b5-api-client";
import { sleep } from "@etherspot/prime-sdk/dist/sdk/common";
import { useKioscoinWallet } from "@/components/web3/AccountAbstraction/KioscoinWalletProvider";

export const useTransactionHandler = (
  setTransaction: (transaction: any) => void,
  t: (key: string) => string,
  checkTransactionStatus: (
    transactionHash: string,
    chainId: number
  ) => Promise<TransactionStatusResponse>
) => {
  const {
    transferFromSmartWalletToEOA,
    transferFromEOAToSW,
    getUserOperationReceipt,
  } = useEtherspotFlow();
  const { currentChainId } = useKioscoinWallet();
  const chainId = currentChainId;

  const handleTransaction = async (
    transactionType: "EOAToSW" | "EtherspotToEOA",
    selectedCoinAddress: string,
    transferAmount: string
  ) => {
    try {
      setTransaction({
        status: "sending",
        message: t("sending_tx_blockchain"),
        progress: 50,
      });
      if (transactionType === "EOAToSW") {
        const transactionHash = await transferFromEOAToSW(
          selectedCoinAddress,
          transferAmount
        );
        await checkTransactionStatus(transactionHash, chainId);
      } else {
        const hash = await transferFromSmartWalletToEOA(
          selectedCoinAddress,
          transferAmount,
          chainId
        );
        let opsReceipt = null;
        if (hash) {
          const timeout = Date.now() + 300000; // 5 minute timeout
          while (opsReceipt == null && Date.now() < timeout) {
            await sleep(2);
            opsReceipt = await getUserOperationReceipt(hash);
            console.log("opsReceipt", opsReceipt);
          }
        }
        if (opsReceipt != undefined && opsReceipt.success) {
          setTransaction({
            status: "success",
            message: t("transaction_success"),
            progress: 100,
          });
        } else {
          setTransaction({
            status: "error",
            message: t("transaction_failed"),
            progress: 0,
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
