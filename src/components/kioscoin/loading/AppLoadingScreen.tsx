import { useTranslation } from "react-i18next";
import KioscoinBrand from "@/components/kioscoin/branding/KioscoinBrand";

export function AppLoadingScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-background/95 to-background px-4">
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {/* Brand Logo */}
        <KioscoinBrand size="md" showSlogan animateSlogan />

        {/* Loading Text */}
        <div className="text-center space-y-2">
          {/* <p className="font-secondary font-semibold text-primary text-sm">
            {t("loading_kioscoin")}
          </p> */}
          <p className="font-secondary text-xs text-muted-foreground">
            {t("setting_up_experience")}
          </p>
        </div>

        {/* Subtle animation dots */}
        <div className="flex gap-1.5">
          <div
            className="h-2 w-2 rounded-full bg-secondary animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="h-2 w-2 rounded-full bg-secondary animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="h-2 w-2 rounded-full bg-secondary animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
