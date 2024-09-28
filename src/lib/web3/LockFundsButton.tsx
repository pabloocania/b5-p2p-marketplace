import React from "react";
import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client";
// import { useEtherspotFlow } from "@/";
import { useEtherspotSdk } from "./EtherspotSdkProvider";
import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";

interface LockFundsButtonProps {
  order: Order;
  onRefresh?: () => void;
  canLock: boolean;
}

const LockFundsButton: React.FC<LockFundsButtonProps> = ({
  order,
  onRefresh,
  canLock,
}) => {
  const { primeSdk, swAddress, balances: stablecoin } = useEtherspotSdk();
  const { lockFunds, batchApproveAndEscrow } = useEtherspotFlow(); // Import the lockFunds function from the hook
  return canLock ? (
    <Button
      className="w-full bg-blue-700 text-white"
      onClick={() => {
        batchApproveAndEscrow(order);
        onRefresh?.(); // Call the refresh callback
      }}
    >
      Lock funds
    </Button>
  ) : (
    <div className="bg-yellow-100 text-yellow-700 p-4 text-center">
      Waiting for the seller to lock the funds to proceed.
    </div>
  );
};

export default LockFundsButton;
