import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client";
import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";

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
  const { isConnected } = useAccount();
  const { t } = useTranslation();
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
  return canRelease && isConnected ? (
    <Button
      className="w-full bg-yellow-500 text-white"
      onClick={handleReleaseFunds}
      disabled={isLoading}
    >
      {t("release_funds")}
    </Button>
  ) : null;
};

export default ReleaseFundsButton;
