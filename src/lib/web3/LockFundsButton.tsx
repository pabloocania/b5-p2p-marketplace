import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";

interface LockFundsButtonProps {
  order: any; // Replace 'any' with the actual type of your order
  canLock: boolean;
}

const LockFundsButton: React.FC<LockFundsButtonProps> = ({
  order,
  canLock,
}) => {
  const { batchApproveAndEscrow } = useEtherspotFlow();
  const [isLoading, setIsLoading] = useState(false);

  const handleLockFunds = async () => {
    setIsLoading(true);
    try {
      await batchApproveAndEscrow(order);
    } catch (error) {
      console.error("Error locking funds:", error);
      // Handle error here (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  if (!canLock) {
    return (
      <div className="bg-yellow-100 text-yellow-700 p-4 text-center">
        Waiting for the seller to lock the funds to proceed.
      </div>
    );
  }

  return (
    <Button
      className="w-full bg-blue-700 text-white"
      onClick={handleLockFunds}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Waiting transaction...
        </>
      ) : (
        "Lock funds"
      )}
    </Button>
  );
};

export default LockFundsButton;
