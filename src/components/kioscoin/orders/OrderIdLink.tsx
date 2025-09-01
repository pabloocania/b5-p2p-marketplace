import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import OrderHistory from "./OrderHistory";
import { useTranslation } from "react-i18next";
import { HistoryIcon, ClipboardIcon } from "lucide-react";

interface OrderIdLinkProps {
  orderId?: string;
}

const OrderIdLink: React.FC<OrderIdLinkProps> = ({ orderId }) => {
  const { t } = useTranslation();
  const [isIdSheetOpen, setIsIdSheetOpen] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyId = async () => {
    if (orderId) {
      await navigator.clipboard.writeText(orderId);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Card Ver Historial */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsIdSheetOpen(true);
          }}
          className="flex flex-col items-center gap-2 w-full"
        >
          <HistoryIcon className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium text-primary text-center">
            {t("view_history")}
          </span>
        </button>
      </div>

      {/* Card Copiar ID */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <button
            onClick={handleCopyId}
            className="flex flex-col items-center gap-2 w-full"
          >
            <ClipboardIcon className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-primary text-center">
              {t("copy_id")}
            </span>
          </button>
          {showCopied && (
            <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs text-green-600 bg-white px-2 py-1 rounded-md shadow-sm">
              {t("copied")}
            </span>
          )}
        </div>
      </div>

      <Sheet open={isIdSheetOpen} onOpenChange={setIsIdSheetOpen}>
        <SheetContent
          side="bottom"
          className="flex flex-col justify-between rounded-lg"
          closeText={""}
        >
          <div className="p-4 flex-1 overflow-y-auto">
            <SheetTitle className="text-lg font-semibold mb-4">
              ⏰ {t("order_history")}
            </SheetTitle>
            <OrderHistory orderId={orderId} />
          </div>
          <SheetFooter className="p-4 border-t bg-gray-100 rounded-md">
            <button
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              onClick={() => setIsIdSheetOpen(false)}
            >
              {t("close")}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default OrderIdLink;
