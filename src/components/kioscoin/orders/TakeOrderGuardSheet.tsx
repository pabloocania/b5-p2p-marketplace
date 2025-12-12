import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client";
import { useTranslation } from "react-i18next";
import React from "react";

interface TakeOrderGuardSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  order: Order;
  action: "BUY" | "SELL";
  loading?: boolean;
}

export function TakeOrderGuardSheet({
  open,
  onOpenChange,
  onConfirm,
  order,
  action,
  loading = false,
}: TakeOrderGuardSheetProps) {
  const { t } = useTranslation();
  const token = order.tokenCode ?? "USDT";
  const isActionBuy = action === "BUY";

  const title = isActionBuy
    ? t("take_guard_title_buy", { token })
    : t("take_guard_title_sell", { token });

  const body = isActionBuy
    ? t("take_guard_body_buy")
    : t("take_guard_body_sell");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[50vh] font-secondary border border-primary/20 rounded-t-xl"
        closeText={t("close")}
        closeButtonPosition="right-3 top-2 text-xs"
      >
        <div className="w-full max-w-md mx-auto px-4">
          <div className="rounded-lg border border-gray-300/70 bg-white/80 shadow-sm p-5 sm:p-6">
            <SheetHeader className="space-y-2 mt-2 mb-6">
              <SheetTitle className="text-dark text-base sm:text-lg text-center leading-tight">
                {title}
              </SheetTitle>
              <SheetDescription className="text-center">{body}</SheetDescription>
            </SheetHeader>
            <div className="mb-6 flex justify-center">
              <div className="w-full max-w-sm text-sm space-y-2 p-2 sm:p-3 rounded-md border border-gray-300/70 bg-white/60 shadow-sm">
                <div className="flex items-center">
                  <span className="text-muted-foreground">{t("amount")}:</span>
                  <span className="text-primary font-medium ml-1 whitespace-nowrap">
                    {order.amount} {token}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground">{t("en_ars")}:</span>
                  <span className="text-primary font-medium ml-1 whitespace-nowrap">
                    {order.fiatAmount}
                  </span>
                </div>
              </div>
            </div>
            <SheetFooter className="mt-8 sm:justify-center">
              <div className="w-full max-w-sm mx-auto flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  className="rounded-md h-11 min-h-[44px] px-5 leading-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none hover:bg-transparent hover:text-inherit"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  {t("cancel")}
                </Button>
                <Button
                  className="bg-primary text-white hover:bg-primary/90 rounded-md shadow-sm border border-transparent h-11 min-h-[44px] px-5 leading-none"
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading ? t("taking_order", "Tomando orden…") : t("take_guard_confirm")}
                </Button>
              </div>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


