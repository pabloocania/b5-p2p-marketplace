import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEtherspotFlow } from "@/components/web3/AccountAbstraction/useEtherspotFlow";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import { Order } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { useTransaction } from "@/components/web3/Transactions/TransactionContext";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import LockFundsConfirmation from "@/components/web3/Escrow/LockFundsConfirmation";
import { sleep } from "@etherspot/prime-sdk/dist/sdk/common";

interface LockFundsButtonProps {
  order: Order;
  canLock: boolean;
  onSuccess: () => void;
}

const LockFundsButton: React.FC<LockFundsButtonProps> = ({
  order,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { batchApproveAndEscrow, getUserOperationReceipt } = useEtherspotFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSufficientBalance, setHasSufficientBalance] = useState(true);
  const { balances } = useEtherspotSdk();
  const [isTransacting, setIsTransacting] = useState(false);
  const { setTransaction } = useTransaction();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check balance when component mounts
    const tokenBalance = balances.find(
      (balance) => balance.name === order.tokenCode
    );

    if (tokenBalance) {
      const smartWalletBalance = parseFloat(tokenBalance.smartWalletBalance);
      const orderAmount = parseFloat(order?.amount ?? "0");
      setHasSufficientBalance(smartWalletBalance >= orderAmount);
    } else {
      setHasSufficientBalance(false);
    }
  }, [balances, order.amount]);

  const handleLockFunds = async () => {
    if (!isTransacting) {
      setIsLoading(true);
      onSuccess();
      try {
        if (!hasSufficientBalance) {
          return;
        }
        setIsTransacting(true);
        const txHashPromise = batchApproveAndEscrow(order);
        console.log("txHashPromise", txHashPromise);
        setTransaction({
          status: "idle",
          message: t("initiating_transaction"),
          progress: 0,
        });
        setTimeout(() => {
          setTransaction({
            status: "waiting",
            message: t("approve_and_lock"),
            progress: 45,
          });
        }, 500);

        try {
          const uoOpsHash = await txHashPromise;
          setTransaction({
            status: "sending",
            message: t("sending_tx_blockchain"),
            progress: 70,
          });
          let opsReceipt = null;
          if (uoOpsHash) {
            const timeout = Date.now() + 300000; // 5 minute timeout
            while (opsReceipt == null && Date.now() < timeout) {
              await sleep(5);
              opsReceipt = await getUserOperationReceipt(uoOpsHash);
            }
          }
          if (opsReceipt != undefined && opsReceipt.success) {
            console.log("opsReceipt", opsReceipt);
            setTransaction({
              status: "success",
              message: t("funds_locked"),
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
        setTransaction({
          status: "error",
          message: t("transaction_failed"),
          progress: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            className={`w-full ${
              hasSufficientBalance
                ? "text-white bg-yellow-500"
                : "text-white bg-red-500 border-red-500"
            }`}
            onClick={() =>
              hasSufficientBalance && !isLoading && setIsOpen(true)
            }
            disabled={isLoading || !hasSufficientBalance}
          >
            {hasSufficientBalance ? t("lock_funds") : t("not_enough_balance")}
          </Button>
        </SheetTrigger>
        {!hasSufficientBalance && (
          <p className="text-gray-600 mt-2">{t("info_text_fund_wallet")}</p>
        )}
        <SheetContent
          side="bottom"
          className="h-[75vh] bg-backgroundMain"
          closeText={t("close")}
        >
          <SheetTitle className="text-lg font-semibold mb-4"></SheetTitle>
          <LockFundsConfirmation
            handleLockFunds={handleLockFunds}
            canLock={isLoading || !hasSufficientBalance}
            order={order}
            onClose={() => setIsOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LockFundsButton;
