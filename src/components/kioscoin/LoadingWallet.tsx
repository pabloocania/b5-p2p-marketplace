import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const LoadingWallet = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex justify-center items-center py-4 font-secondary text-dark">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
        <span className="text-sm block">{t("loading_wallet")}</span>
      </div>
    </div>
  );
};

