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
    <div className="flex items-center justify-center gap-2 text-xs">
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsIdSheetOpen(true);
        }}
        className="flex items-center gap-1 text-primary hover:text-primary/80 hover:underline"
      >
        <HistoryIcon className="w-3 h-3" />
        {t("view_history")}
      </button>
      <span className="text-primary">•</span>
      <div className="relative">
        <button
          onClick={handleCopyId}
          className="flex items-center gap-1 text-primary hover:text-primary/80 hover:underline"
        >
          <ClipboardIcon className="w-3 h-3" />
          {t("copy_id")}
        </button>
        {showCopied && (
          <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs text-green-600 bg-white px-2 py-1 rounded-md shadow-sm">
            {t("copied")}
          </span>
        )}
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
    </div>
  );
};

export default OrderIdLink;
