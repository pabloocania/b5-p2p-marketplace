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
import { ArrowRight, Shield, Wallet, Zap } from "lucide-react";

/**
 * Immutable data class representing onboarding state
 */
class OnboardingState {
  readonly isVisible: boolean;
  readonly currentStep: number;
  readonly totalSteps: number;
  readonly hasSeenOnboarding: boolean;

  private constructor(params: {
    isVisible: boolean;
    currentStep: number;
    totalSteps: number;
    hasSeenOnboarding: boolean;
  }) {
    this.isVisible = params.isVisible;
    this.currentStep = params.currentStep;
    this.totalSteps = params.totalSteps;
    this.hasSeenOnboarding = params.hasSeenOnboarding;
  }

  static create(params: {
    isVisible?: boolean;
    currentStep?: number;
    totalSteps?: number;
    hasSeenOnboarding?: boolean;
  }): OnboardingState {
    return new OnboardingState({
      isVisible: params.isVisible ?? false,
      currentStep: params.currentStep ?? 0,
      totalSteps: params.totalSteps ?? 3,
      hasSeenOnboarding: params.hasSeenOnboarding ?? false,
    });
  }

  hide(): OnboardingState {
    return new OnboardingState({
      ...this,
      isVisible: false,
    });
  }

  show(): OnboardingState {
    return new OnboardingState({
      ...this,
      isVisible: true,
    });
  }

  nextStep(): OnboardingState {
    const newStep = Math.min(this.currentStep + 1, this.totalSteps - 1);
    return new OnboardingState({
      ...this,
      currentStep: newStep,
    });
  }

  prevStep(): OnboardingState {
    const newStep = Math.max(this.currentStep - 1, 0);
    return new OnboardingState({
      ...this,
      currentStep: newStep,
    });
  }

  markAsSeen(): OnboardingState {
    return new OnboardingState({
      ...this,
      hasSeenOnboarding: true,
    });
  }
}

/**
 * Smart Wallet feature representation
 */
class SmartWalletFeature {
  readonly title: string;
  readonly description: string;
  readonly icon: React.ReactNode;

  private constructor(params: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }) {
    this.title = params.title;
    this.description = params.description;
    this.icon = params.icon;
  }

  static create(params: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }): SmartWalletFeature {
    return new SmartWalletFeature(params);
  }
}

interface SmartWalletOnboardingProps {
  onComplete: () => void;
  onStartTransfer?: () => void;
}

export default function SmartWalletOnboarding({
  onComplete,
  onStartTransfer,
}: SmartWalletOnboardingProps) {
  const { t } = useTranslation();
  const [state, setState] = React.useState<OnboardingState>(
    OnboardingState.create({ isVisible: true })
  );

  // Define features using immutable objects
  const features = React.useMemo(
    () => [
      SmartWalletFeature.create({
        title: t("smart_wallet_feature_1_title", "Gasless Transactions"),
        description: t(
          "smart_wallet_feature_1_desc",
          "Perform transactions without needing ETH for gas fees"
        ),
        icon: <Zap className="h-10 w-10 text-yellow-500" />,
      }),
      SmartWalletFeature.create({
        title: t("smart_wallet_feature_2_title", "Enhanced Security"),
        description: t(
          "smart_wallet_feature_2_desc",
          "Improved security with social recovery and multi-signature support"
        ),
        icon: <Shield className="h-10 w-10 text-green-500" />,
      }),
      SmartWalletFeature.create({
        title: t("smart_wallet_feature_3_title", "Simplified Experience"),
        description: t(
          "smart_wallet_feature_3_desc",
          "Use dApps with a simplified user experience, similar to Web2"
        ),
        icon: <Wallet className="h-10 w-10 text-blue-500" />,
      }),
    ],
    [t]
  );

  const handleNext = () => {
    if (state.currentStep === state.totalSteps - 1) {
      // Last step, complete onboarding
      setState(state.hide().markAsSeen());
      onComplete();
    } else {
      // Go to next step
      setState(state.nextStep());
    }
  };

  const handlePrevious = () => {
    setState(state.prevStep());
  };

  const handleSkip = () => {
    setState(state.hide().markAsSeen());
    onComplete();
  };

  const currentFeature = features[state.currentStep];

  return (
    <Dialog
      open={state.isVisible}
      onOpenChange={(open) => !open && handleSkip()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-primary">
            {t("smart_wallet_onboarding_title", "Welcome to Smart Wallet")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t(
              "smart_wallet_onboarding_subtitle",
              "Learn about the benefits of using a Smart Wallet"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="bg-secondary bg-opacity-10 p-4 rounded-full">
            {currentFeature.icon}
          </div>
          <h3 className="text-lg font-semibold text-primary">
            {currentFeature.title}
          </h3>
          <p className="text-center text-sm text-primary opacity-80">
            {currentFeature.description}
          </p>

          <div className="flex space-x-2 pt-4">
            {Array.from({ length: features.length }).map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === state.currentStep ? "bg-secondary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {state.currentStep > 0 && (
            <Button variant="outline" onClick={handlePrevious}>
              {t("previous", "Previous")}
            </Button>
          )}
          <Button variant="outline" onClick={handleSkip}>
            {t("skip", "Skip")}
          </Button>
          <Button className="bg-secondary text-white" onClick={handleNext}>
            {state.currentStep === state.totalSteps - 1
              ? t("got_it", "Got it!")
              : t("next", "Next")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
