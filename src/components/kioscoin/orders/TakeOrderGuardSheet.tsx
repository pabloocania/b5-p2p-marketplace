import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client";
import { useTranslation } from "react-i18next";
import React from "react";
import { ArrowRight } from "lucide-react";
import { CryptoAmountIcon } from "../CryptoIcon";

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
        className="h-[50vh] font-secondary border border-primary/20 rounded-t-xl overscroll bg-backgroundSecondary pt-10 px-2"
        closeText={t("close")}
        closeButtonPosition="right-3 top-2 text-xs"
      >
        <div className="w-full max-w-md mx-auto px-2">
          <div className="rounded-lg border border-gray-300/70 bg-white/80 shadow-sm p-3">
            <SheetHeader className="space-y-2 mt-2 mb-6">
              <SheetTitle className="text-dark text-base sm:text-lg text-center leading-tight">
                {title}
              </SheetTitle>
              <SheetDescription className="text-center">
                {body}
              </SheetDescription>
            </SheetHeader>
            <div className="mb-6 flex justify-center">
              <div className="w-full max-w-sm text-sm space-y-2 p-2 sm:p-3 rounded-md border border-gray-300/70 bg-white/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("amount")}:</span>
                  <CryptoAmountIcon
                    formattedAmount={order.amount ?? "0"}
                    tokenCode={token.toLowerCase()}
                    textSizeClass="text-sm text-dark"
                    iconSize="sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("en_ars")}:</span>
                  <span className="text-dark font-bold">
                    {order.fiatAmount} {order.fiatCode ?? "ARS"}
                  </span>
                </div>
              </div>
            </div>
            <SheetFooter className="mt-6">
              <div className="w-full flex flex-col gap-3">
                <Button
                  className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-md shadow-sm h-11 min-h-[44px]"
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading
                    ? t("taking_order", "Tomando orden…")
                    : t("take_guard_confirm")}
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
