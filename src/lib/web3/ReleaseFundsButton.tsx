import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client";
import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";
import { useTransaction } from "./TransactionContext";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ReleaseFundsConfirmation from "@/components/ui/ReleaseFundsConfirmation";
import { sleep } from "@etherspot/prime-sdk/dist/sdk/common";

interface ReleaseFundsButtonProps {
  order: Order;
  onRefresh?: () => void;
  canRelease: boolean;
}

export const ReleaseFundsButton: React.FC<ReleaseFundsButtonProps> = ({
  order,
  onRefresh,
  canRelease,
}) => {
  const [isTransacting, setIsTransacting] = useState(false);
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const { releaseFunds, getUserOperationReceipt } = useEtherspotFlow(); // Import the lockFunds function from the hook
  const { setTransaction } = useTransaction();
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);

  const handleReleaseFunds = async () => {
    if (!isTransacting) {
      setIsLoading(true);
      try {
        setIsTransacting(true);
        const txHashPromise = releaseFunds(order);
        setTransaction({
          status: "idle",
          message: t("initiating_transaction"),
          progress: 0,
        });
        setTimeout(() => {
          setTransaction({
            status: "waiting",
            message: t("releasing_funds"),
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
            setTransaction({
              status: "success",
              message: t("funds_released"),
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
        // Handle error here (e.g., show an error message to the user)
      } finally {
        setIsLoading(false);
      }
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  return canRelease && isConnected ? (
    <div>
      <Sheet open={isReleaseOpen} onOpenChange={setIsReleaseOpen}>
        <SheetTrigger asChild>
          <Button
            className="w-full text-white bg-yellow-500"
            onClick={() => setIsReleaseOpen(true)}
          >
            {t("release_funds")}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="h-[90vh] bg-backgroundMain"
          closeText={t("close")}
        >
          <SheetTitle className="text-lg font-semibold mb-4"></SheetTitle>
          <ReleaseFundsConfirmation
            order={order}
            onClose={() => setIsReleaseOpen(false)}
            handleReleaseFunds={handleReleaseFunds}
            isLoading={isLoading}
          />
        </SheetContent>
      </Sheet>
    </div>
  ) : null;
};

export default ReleaseFundsButton;
