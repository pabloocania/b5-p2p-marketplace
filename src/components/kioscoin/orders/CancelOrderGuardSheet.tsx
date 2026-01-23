import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import React from "react";
import { XCircle } from "lucide-react";

interface CancelOrderGuardSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
}

export function CancelOrderGuardSheet({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: CancelOrderGuardSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[50vh] font-secondary border border-primary/20 rounded-t-xl overscroll bg-backgroundSecondary pt-10 px-2"
        closeText={t("close")}
      >
        <div className="w-full max-w-md mx-auto px-4">
          <div className="rounded-lg border border-gray-300/70 bg-white/80 shadow-sm p-3">
            <SheetHeader className="space-y-2 mb-6">
              <SheetTitle className="text-dark text-center">
                {t(
                  "cancel_order_title",
                  "¿Estás seguro de cancelar esta orden?"
                )}
              </SheetTitle>
              <SheetDescription className="text-center">
                {t(
                  "cancel_order_body",
                  "Esta acción no se puede deshacer. La orden será cancelada permanentemente."
                )}
              </SheetDescription>
            </SheetHeader>

            <SheetFooter className="mt-6">
              <div className="w-full flex flex-col gap-3">
                <Button
                  className="w-full bg-primary text-xs text-white hover:bg-secondary rounded-md shadow-sm h-11 min-h-[44px]"
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading
                    ? t("cancelling_order", "Cancelando orden…")
                    : t("confirm_cancel_order", "Sí, cancelar orden")}
                </Button>
                <Button
                  variant="outline"
                  className="font-secondary w-full items-center gap-2 text-xs border-primary text-dark hover:bg-terciary hover:text-primary"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  {t("close")}
                </Button>
              </div>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
