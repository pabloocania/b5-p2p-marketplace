import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";
import { useEtherspotSdk } from "../../lib/web3/EtherspotSdkProvider";
import { Order } from "b5-api-client";
import { useTranslation } from "react-i18next";

interface LockFundsButtonProps {
  order: Order; // Replace 'any' with the actual type of your order
  canLock: boolean;
}

const LockFundsButton: React.FC<LockFundsButtonProps> = ({ order }) => {
  const { t } = useTranslation();
  const { batchApproveAndEscrow } = useEtherspotFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSufficientBalance, setHasSufficientBalance] = useState(true);
  const { balances } = useEtherspotSdk();

  useEffect(() => {
    // Check balance when component mounts
    const tokenBalance = balances.find(
      (balance) => balance.name === order.tokenCode
    );
    if (
      !tokenBalance ||
      tokenBalance.smartWalletBalance < (order?.amount ?? 0)
    ) {
      setHasSufficientBalance(false);
    } else {
      setHasSufficientBalance(true);
    }
  }, [balances, order.amount]);

  const handleLockFunds = async () => {
    setIsLoading(true);
    try {
      if (!hasSufficientBalance) {
        return;
      }
      await batchApproveAndEscrow(order);
      // await lockFunds(order);
      // lockFunds
    } catch (error) {
      console.error("Error locking funds:", error);
      // Handle error here (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full bg-primary text-white"
      onClick={handleLockFunds}
      disabled={isLoading || !hasSufficientBalance}
    >
      {hasSufficientBalance ? t("lock_funds") : t("not_enough_funds")}
    </Button>
  );
};

export default LockFundsButton;
