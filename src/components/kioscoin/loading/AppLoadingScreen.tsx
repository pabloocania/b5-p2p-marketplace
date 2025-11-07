import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AppLoadingScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-background/95 to-background px-4">
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {/* Loading Card */}
        <div className="border border-primary bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center w-full shadow-lg hover:shadow-xl transition-all">
          <div className="flex flex-col items-center gap-4">
            {/* Spinner */}
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-secondary animate-spin" />
              </div>
            </div>

            {/* Loading Text */}
            <div className="space-y-2">
              <p className="font-secondary font-semibold text-primary text-sm">
                {t("loading_kioscoin")}
              </p>
              <p className="font-secondary text-xs text-muted-foreground">
                {t("setting_up_experience")}
              </p>
            </div>
          </div>
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
