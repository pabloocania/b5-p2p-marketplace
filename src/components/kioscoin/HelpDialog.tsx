import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // 0:intro, 1:wallet info, 2:terms

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 max-h-[90vh] overflow-y-auto font-secondary">
        <DialogHeader>
          {step === 0 && (
            <>
              <DialogTitle className="text-2xl font-bold text-primary mb-1">
                {t("help_and_tutorials")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t("help_description")}
              </DialogDescription>
            </>
          )}
          {step === 1 && (
            <>
              <DialogTitle className="text-2xl font-bold text-primary mb-1">
                {t("help_step2_title", "Kioscoin wallet")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t("kioskoin_onboarding_subtitle")}
              </DialogDescription>
            </>
          )}
          {step === 2 && (
            <>
              <DialogTitle className="text-2xl font-bold text-primary mb-1">
                {t("help_step3_title", "Acepto Términos y condiciones")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t("kioskoin_onboarding_subtitle")}
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {step === 0 && (
          <>
            {/* Video */}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-primary">
                📺 {t("video_intro_title")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("video_intro_description")}
              </p>
              <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                <div className="text-muted-foreground text-sm">
                  {t("video_placeholder_text", "Video placeholder")}
                </div>
              </div>
            </div>

            {/* Help Sections */}
            <div className="space-y-6 mt-6 text-sm leading-relaxed text-gray-700">
              <section className="space-y-2">
                <h3 className="font-semibold text-base text-primary">
                  {t("getting_started")}
                </h3>
                <ol className="list-decimal list-inside pl-4 space-y-1">
                  {t("getting_started_description")
                    .split("\n")
                    .map((line, i) => (
                      <li key={i}>{line.replace(/^\d+\.\s/, "")}</li>
                    ))}
                </ol>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-primary">
                  {t("how_to_trade")}
                </h3>
                <ol className="list-decimal list-inside pl-4 space-y-1">
                  {t("how_to_trade_description")
                    .split("\n")
                    .map((line, i) => (
                      <li key={i}>{line.replace(/^\d+\.\s/, "")}</li>
                    ))}
                </ol>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-base text-primary">
                  {t("safety_tips")}
                </h3>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  {t("safety_tips_description")
                    .split("\n")
                    .map((tip, i) => (
                      <li key={i}>{tip.replace(/^•\s/, "")}</li>
                    ))}
                </ul>
              </section>
            </div>
          </>
        )}

        {step === 1 && (
          <div className="space-y-3 mt-2 text-sm leading-relaxed text-gray-700">
            <h3 className="font-semibold text-base text-primary">
              {t("help_step2_title", "Kioscoin wallet")}
            </h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              {t("help_step2_lines")
                .split("\n")
                .map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
            </ul>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 mt-2 text-sm leading-relaxed text-gray-700">
            <h3 className="font-semibold text-base text-primary">
              {t("help_step3_title", "Acepto Términos y condiciones")}
            </h3>
            <ul className="list-disc list-inside pl-4 space-y-1">
              {t("help_step3_lines")
                .split("\n")
                .map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
            </ul>
          </div>
        )}

        {/* Footer navigation */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i === step ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                {t("previous", "Previous")}
              </Button>
            )}
            {step < 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-primary"
              >
                {t("skip", "Skip")}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() =>
                step === 2 ? onOpenChange(false) : setStep((s) => Math.min(2, s + 1))
              }
              className="bg-secondary text-white"
            >
              {step === 2 ? t("help_accept_tyc", "Acepto TyC") : t("next", "Next")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
