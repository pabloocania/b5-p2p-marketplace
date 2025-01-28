import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import OrderHistory from "./OrderHistory";
import { useTranslation } from "react-i18next";

interface OrderIdLinkProps {
  orderId?: string;
}

const OrderIdLink: React.FC<OrderIdLinkProps> = ({ orderId }) => {
  const { t } = useTranslation();
  const [isIdSheetOpen, setIsIdSheetOpen] = useState(false);

  return (
    <div>
      <div className="block text-center pb-1">
        <a
          href="#"
          className="text-blue-500 text-xs underline hover:text-blue-700 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            setIsIdSheetOpen(true);
          }}
        >
          ID: {orderId}
        </a>
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
