import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import React from "react";
import { CheckCircle2 } from "lucide-react";

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
        className="h-[50vh] font-secondary border border-primary/20 rounded-t-xl"
        closeText={t("close")}
      >
        <div className="w-full max-w-md mx-auto px-4">
          <div className="rounded-xl border border-gray-300/70 bg-white/80 shadow-sm p-5 sm:p-6">
            <SheetHeader className="space-y-2 mb-6">
              <SheetTitle className="text-center">
                {t("fiat_guard_title", "¿Hiciste la transferencia al otro usuario?")}
              </SheetTitle>
              <SheetDescription className="text-center">
                {t(
                  "fiat_guard_body",
                  "Presioná “Notificar depósito” solo si ya enviaste el dinero por el método acordado."
                )}
              </SheetDescription>
            </SheetHeader>

            <SheetFooter className="gap-2 sm:justify-center">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                {t("cancel")}
              </Button>
              <Button
                className="bg-primary text-white hover:bg-primary/90 rounded-xl shadow-sm border border-white/20"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? t("sending", "Sending...") : t("fiat_guard_confirm", "Sí, notificar depósito")}
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


