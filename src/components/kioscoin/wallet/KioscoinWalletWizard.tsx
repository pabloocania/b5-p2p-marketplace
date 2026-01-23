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
import {
  Wallet,
  Download,
  Upload,
  KeyRound,
  Copy,
  DollarSign,
  Settings,
} from "lucide-react";

interface KioscoinWalletWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
  initialStep?: number;
  address?: string;
}

export default function KioscoinWalletWizard({
  open,
  onClose,
  onComplete,
  initialStep = 0,
  address,
}: KioscoinWalletWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = React.useState(initialStep);
  const [copied, setCopied] = React.useState(false);

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  type Step = {
    icon: React.ReactNode;
    title: string;
    description: string;
    extra?: React.ReactNode;
  };

  const steps: Step[] = [
    {
      icon: <Wallet className="h-6 w-6 text-primary" />,
      title: t("wallet_step_address_title", "Your Kioscoin address"),
      description: t(
        "wallet_step_address_desc",
        "This is your Kioscoin wallet address. Share it to receive funds."
      ),
      extra: address ? (
        <div className="mt-2 w-full flex flex-col items-center gap-2">
          <code className="text-xs break-all font-bold text-primary/90 bg-secondary/5 border border-secondary/20 rounded px-2 py-1 w-full text-center">
            {address}
          </code>
          <Button
            variant="link"
            size="sm"
            className="text-xs font-secondary text-primary hover:bg-terciary hover:text-primary"
            onClick={copyAddress}
          >
            <Copy className="h-4 w-4 mr-1" />
            {copied ? t("copied", "Copied!") : t("copy", "Copy")}
          </Button>
        </div>
      ) : undefined,
    },
    // {
    //   icon: <Download className="h-6 w-6 text-green-600" />,
    //   title: t("wallet_step_receive_title", "Receive"),
    //   description: t(
    //     "wallet_step_receive_desc",
    //     "Deposit stablecoins into your Kioscoin wallet using your address."
    //   ),
    // },
    {
      icon: <Upload className="h-6 w-6 text-primary" />,
      title: t("wallet_step_send_title", "Send"),
      description: t(
        "wallet_step_send_desc",
        "Transfer stablecoins from your Kioscoin wallet to an external address."
      ),
    },
    {
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      title: t("wallet_step_balances_title", "Balances"),
      description: "",
      extra: (
        <p className="text-xs text-center text-dark mb-2">
          {t(
            "wallet_step_balances_extra",
            "See your current balance by selecting the blockchain (left) and the crypto dolar (right)"
          )}
        </p>
      ),
    },
    {
      icon: <Settings className="h-6 w-6 text-primary" />,
      title: t("wallet_step_preferences_title", "Preferencias"),
      description: "",
      extra: (
        <p className="text-xs text-center text-dark mb-2">
          {t(
            "wallet_step_preferences_extra",
            "Here you can add your preferred payment methods, manage push notifications and see your security details"
          )}
        </p>
      ),
    },
    {
      icon: <KeyRound className="h-6 w-6 text-amber-600" />,
      title: t("wallet_step_seed_title", "Seed phrase"),
      description: t(
        "wallet_step_seed_desc",
        "Keep your seed phrase safe and never share it with anyone."
      ),
    },
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step === steps.length - 1) {
      onComplete?.();
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto px-6 py-4 font-secondary">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-primary">
            {t("wallet_wizard_title", "Kioscoin wallet")}
          </DialogTitle>
          {/* <DialogDescription className="text-center">
            {t(
              "wallet_wizard_subtitle",
              "Learn how to use your Kioscoin wallet"
            )}
          </DialogDescription> */}
        </DialogHeader>

        <div className="flex flex-col items-center pt-1 space-y-3">
          <div className="flex flex-col items-center space-y-2">
            {current.icon}
            <h3 className="text-primary text-center font-bold">
              {current.title}
            </h3>
            {current.description && (
              <p className="text-xs text-center text-dark mb-2">
                {current.description}
              </p>
            )}
            {current.extra}
          </div>

          <div className="flex space-x-2 pt-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === step ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {step > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => s - 1)}
              className="text-xs font-secondary border-primary text-dark hover:bg-terciary hover:text-primary"
            >
              {t("previous", "Previous")}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-secondary border-primary text-dark hover:bg-terciary hover:text-primary"
          >
            {t("skip", "Skip")}
          </Button>
          <Button
            size="sm"
            className="bg-secondary text-white text-xs font-secondary shadow-md hover:bg-secondary/90"
            onClick={handleNext}
          >
            {step === steps.length - 1
              ? t("wallet_done", "Done")
              : t("next", "Next")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
