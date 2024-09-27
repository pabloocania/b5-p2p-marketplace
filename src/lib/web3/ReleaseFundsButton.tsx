import React from "react";
import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client";
import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";

interface ReleaseFundsButtonProps {
  order: Order;
  releaseFunds: (order: Order) => void;
  onRefresh?: () => void;
  canRelease: boolean;
}

const ReleaseFundsButton: React.FC<ReleaseFundsButtonProps> = ({
  order,
  releaseFunds,
  onRefresh,
  canRelease,
}) => {
  //   const { lockFunds,} = useEtherspotFlow(); // Import the lockFunds function from the hook
  return canRelease ? (
    <Button
      className="w-full bg-blue-700 text-white"
      onClick={() => {
        releaseFunds(order);
        onRefresh?.(); // Call the refresh callback
      }}
    >
      Release Funds
    </Button>
  ) : (
    <div className="bg-yellow-100 text-yellow-700 p-4 text-center">
      Waiting for the seller to release the funds to proceed.
    </div>
  );
};

export default ReleaseFundsButton;
