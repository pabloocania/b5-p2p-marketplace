import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Zap, Shield, Wallet, Info, CheckCircle2 } from "lucide-react";

interface KioskoinOnboardingProps {
  onComplete: () => void;
}

export default function KioskoinOnboarding({
  onComplete,
}: KioskoinOnboardingProps) {
  const { t } = useTranslation();
  const [step, setStep] = React.useState(0);

  const steps = [
    {
      title: t("kioskoin_step_1_title"),
      description: t("kioskoin_step_1_desc"),
      icon: <Info className="h-10 w-10 text-blue-500 animate-bounce" />,
    },
    {
      title: t("kioskoin_step_2_title"),
      description: t("kioskoin_step_2_desc"),
      icon: <Wallet className="h-10 w-10 text-purple-500" />,
      video: "https://www.youtube.com/embed/6LciO-EwQrM",
    },
    {
      title: t("kioskoin_step_3_title"),
      subtitle: t("kioskoin_step_3_subtitle"),
      icon: (
        <div className="relative flex items-center justify-center">
          <div className="absolute h-14 w-14 rounded-full bg-yellow-300 opacity-30 animate-ping"></div>
          <div className="z-10 bg-secondary bg-opacity-10 p-4 rounded-full shadow-lg animate-spin-slow">
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step === steps.length - 1) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto px-6 py-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-primary">
            {t("kioskoin_onboarding_title")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {t("kioskoin_onboarding_subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center pt-4 space-y-4">
          <div className="flex flex-col items-center space-y-1 -mt-2">
            {current.icon}
            <h3 className="text-lg font-semibold text-primary text-center leading-tight">
              {current.title}
            </h3>
            {step !== 2 && (
              <p className="text-center text-sm text-muted-foreground leading-snug max-w-sm">
                {current.description}
              </p>
            )}
            {step === 2 && (
              <p className="text-center text-sm text-muted-foreground">
                {current.subtitle}
              </p>
            )}
          </div>

          {step === 2 && (
            <div className="bg-white border rounded-lg shadow-sm p-4 w-full space-y-3 mt-2">
              {[
                t("kioskoin_step_3_benefit_1"),
                t("kioskoin_step_3_benefit_2"),
                t("kioskoin_step_3_benefit_3"),
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b pb-1 last:border-b-0"
                >
                  <span className="text-sm text-primary">{item}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500 min-w-[1.25rem]" />
                </div>
              ))}
              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1 mt-2">
                <Info className="w-3 h-3 text-muted-foreground" />
                {t("kioskoin_step_3_note")}
              </p>
            </div>
          )}

          {current.video && (
            <div className="w-full aspect-video mt-4 rounded-md overflow-hidden border">
              <iframe
                src={current.video}
                title="Onboarding Video"
                className="w-full h-full"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === step ? "bg-secondary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={handlePrevious}>
              {t("previous", "Previous")}
            </Button>
          )}
          <Button variant="outline" onClick={handleSkip}>
            {t("skip", "Skip")}
          </Button>
          <Button className="bg-secondary text-white" onClick={handleNext}>
            {step === steps.length - 1
              ? t("activate_smart_wallet", "Activate Smart Wallet")
              : t("next", "Next")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Tailwind custom animation class (add in your global styles or tailwind.config.js)
// .animate-spin-slow {
//   animation: spin 5s linear infinite;
// }
