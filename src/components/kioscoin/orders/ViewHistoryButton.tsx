"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { HistoryIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import OrderHistory from "./OrderHistory";

interface ViewHistoryButtonProps {
  orderId?: string;
}

const ViewHistoryButton: React.FC<ViewHistoryButtonProps> = ({ orderId }) => {
  const { t } = useTranslation();
  const [isIdSheetOpen, setIsIdSheetOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsIdSheetOpen(true);
          }}
          className="flex flex-col items-center gap-2 w-full"
        >
          <HistoryIcon className="w-5 h-5" style={{ color: "#9e8cbe" }} />
          <span className="text-xs font-medium text-center font-secondary text-gray-500">
            {t("view_history")}
          </span>
        </button>
      </div>

      <Sheet open={isIdSheetOpen} onOpenChange={setIsIdSheetOpen}>
        <SheetContent
          side="bottom"
          className="flex flex-col justify-between rounded-lg"
          closeText={""}
        >
          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-dark">
              ⏰ {t("order_history")}
            </h2>
            <OrderHistory orderId={orderId} />
          </div>
          <SheetFooter className="p-4 border-t bg-gray-100 rounded-md">
            <button
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition font-secondary"
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

export default ViewHistoryButton;
