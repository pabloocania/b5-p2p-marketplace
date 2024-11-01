import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client";
import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";

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
  const { releaseFunds } = useEtherspotFlow(); // Import the lockFunds function from the hook

  const handleReleaseFunds = async () => {
    setIsLoading(true);
    try {
      await releaseFunds(order);
      // await lockFunds(order);
      // lockFunds
    } catch (error) {
      console.error("Error locking funds:", error);
      // Handle error here (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  return canRelease ? (
    <Button
      className="w-full bg-blue-700 text-white border border-black"
      onClick={handleReleaseFunds}
      disabled={isLoading}
    >
      Release Funds
    </Button>
  ) : null;
};

export default ReleaseFundsButton;
