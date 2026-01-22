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

type Step1FlowId = "buy" | "sell";

interface StepSectionProps {
  title: string;
  steps: string[];
}

const StepSection = ({ title, steps }: StepSectionProps) => (
  <section className="rounded-xl border border-secondary/20 bg-secondary/10 p-4 shadow-sm">
    <ol className="list-decimal list-inside space-y-1 text-xs text-dark sm:text-sm">
      {steps.map((line, index) => (
        <li key={`${title}-${index}`}>{line}</li>
      ))}
    </ol>
  </section>
);

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(0); // 0:intro, 1:wallet info, 2:terms
  const [selectedFlow, setSelectedFlow] = useState<Step1FlowId | null>(null);
  const isSpanish = i18n.language?.startsWith("es");
  const faqDocUrl = "/FAQs";
  const parseSteps = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  const step1Sections = [
    {
      id: "buy",
      title: t("help_buy_crypto_dolar_title"),
      steps: parseSteps(t("help_buy_crypto_dolar_steps")),
    },
    {
      id: "sell",
      title: t("help_sell_crypto_dolar_title"),
      steps: parseSteps(t("help_sell_crypto_dolar_steps")),
    },
  ] as const;
  const selectedSection = step1Sections.find(
    (section) => section.id === selectedFlow
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 max-h-[90vh] overflow-y-auto font-secondary space-y-2">
        <DialogHeader>
          {step === 0 && (
            <>
              <DialogTitle className="text-2xl font-bold text-primary text-center">
                {t("welcome_to_kioscoin")}
              </DialogTitle>
              <DialogDescription className="text-sm text-dark text-center mb-4">
                {t("what_is_kioscoin_description")}
              </DialogDescription>
              <DialogTitle className="text-xl font-bold text-primary text-center">
                {t("help_and_tutorials")}
              </DialogTitle>
              <DialogDescription className="text-sm text-dark text-center">
                {t("help_description")}
              </DialogDescription>
            </>
          )}
          {step === 1 && (
            <>
              <DialogTitle className="text-xl font-bold text-primary mb-1 text-center">
                {t("help_step2_title")}
              </DialogTitle>
              {/* <DialogDescription className="text-sm text-muted-foreground">
                {t("kioskoin_onboarding_subtitle")}
              </DialogDescription> */}
            </>
          )}
          {step === 2 && (
            <>
              <DialogTitle className="text-xl font-bold text-primary text-center">
                {isSpanish ? "Preguntas frecuentes" : "Frequent questions"}
              </DialogTitle>
            </>
          )}
        </DialogHeader>

        {step === 0 && (
          <>
            {/* <section className="space-y-2">
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
            </section> */}
            {/* Video */}
            {/* <div className="mt-4 space-y-2">
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
            </div> */}

            {/* Help Sections */}
            {/* <div className="space-y-6 mt-6 text-sm leading-relaxed text-gray-700">
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
            </div> */}
          </>
        )}

        {step === 1 && (
          <div className="space-y-3 text-sm leading-relaxed">
            <div className="grid gap-2 rounded-xl sm:grid-cols-2">
              {step1Sections.map((section) => {
                const isSelected = selectedFlow === section.id;
                return (
                  <Button
                    key={section.id}
                    type="button"
                    variant={isSelected ? "secondary" : "outline"}
                    className={`justify-center rounded-lg border border-secondary font-secondary sm:text-xs ${
                      isSelected
                        ? "bg-secondary text-white shadow-md hover:bg-secondary/90"
                        : "text-dark hover:bg-terciary"
                    }`}
                    onClick={() =>
                      setSelectedFlow((current) =>
                        current === section.id ? null : section.id
                      )
                    }
                  >
                    {section.title}
                  </Button>
                );
              })}
            </div>
            {selectedSection && (
              <StepSection
                title={selectedSection.title}
                steps={selectedSection.steps}
              />
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 text-sm leading-relaxed text-dark text-center">
            <p>
              {isSpanish
                ? "Para más información dirígete a la sección de preguntas frecuentes."
                : "For more information, go to the frequently asked questions section."}
            </p>
            <a
              href={faqDocUrl}
              className="text-primary underline decoration-primary/40 hover:decoration-primary"
            >
              {faqDocUrl.replace("/", "")}
            </a>
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
                className="text-xs font-secondary border-primary text-dark hover:bg-terciary hover:text-primary"
              >
                {t("previous", "Previous")}
              </Button>
            )}
            {step < 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs font-secondary border-primary text-dark hover:bg-terciary hover:text-primary"
              >
                {t("skip", "Skip")}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() =>
                step === 2
                  ? onOpenChange(false)
                  : setStep((s) => Math.min(2, s + 1))
              }
              className="bg-secondary text-white text-xs font-secondary shadow-md hover:bg-secondary/90"
            >
              {step === 2
                ? isSpanish
                  ? "Cerrar"
                  : "Close"
                : t("next", "Next")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
