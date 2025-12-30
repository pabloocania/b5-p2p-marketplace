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
import { ArrowRight } from "lucide-react";

interface FiatSentGuardSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
}

export function FiatSentGuardSheet({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: FiatSentGuardSheetProps) {
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
                  "fiat_guard_title",
                  "¿Hiciste la transferencia al otro usuario?"
                )}
              </SheetTitle>
              <SheetDescription className="text-center">
                {t(
                  "fiat_guard_body",
                  "Presioná “Notificar depósito” solo si ya enviaste el dinero por el método acordado."
                )}
              </SheetDescription>
            </SheetHeader>

            <SheetFooter className="mt-6">
              <div className="w-full flex flex-col gap-3">
                <Button
                  className="w-full bg-secondary text-white hover:bg-secondary/90 rounded-md shadow-sm h-11 min-h-[44px]"
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading
                    ? t("notifying_seller", "Notificando al vendedor…")
                    : t("fiat_guard_confirm", "notificar depósito")}
                  <ArrowRight className="ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-md h-11 min-h-[44px] focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-transparent hover:text-inherit"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  {t("cancel")}
                </Button>
              </div>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
