import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";
import { useEtherspotSdk } from "../../lib/web3/EtherspotSdkProvider";
import { Order } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { useTransaction } from "./TransactionContext";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import LockFundsConfirmation from "@/components/ui/LockFundsConfirmation";

interface LockFundsButtonProps {
  order: Order;
  canLock: boolean;
}

const LockFundsButton: React.FC<LockFundsButtonProps> = ({ order }) => {
  const { t } = useTranslation();
  const { batchApproveAndEscrow } = useEtherspotFlow();
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
      try {
        if (!hasSufficientBalance) {
          return;
        }
        setIsTransacting(true);
        const opsReceiptPromise = batchApproveAndEscrow(order);
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
          const opsReceipt = await opsReceiptPromise;
          if (opsReceipt != undefined && opsReceipt.success) {
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
            className="w-full text-white bg-yellow-500"
            onClick={() => setIsOpen(true)}
          >
            {hasSufficientBalance ? t("lock_funds") : t("not_enough_balance")}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="h-[90vh] bg-backgroundMain"
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
