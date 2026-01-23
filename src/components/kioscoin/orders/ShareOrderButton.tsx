import { useState } from "react";
import { Share2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { copyOrderShareLink } from "@/lib/deeplink";
import { useTranslation } from "react-i18next";

interface ShareOrderButtonProps {
  readonly orderId: string;
}

export const ShareOrderButton: React.FC<ShareOrderButtonProps> = ({
  orderId,
}) => {
  const { t } = useTranslation();
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyLink = async () => {
    const success = await copyOrderShareLink(orderId);
    if (success) {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center relative w-full">
      <IconButton
        className="p-2 font-secondary border-primary/50 bg-white text-primary hover:bg-secondary/20 w-full justify-center"
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        icon={Share2}
        aria-label="share"
        label={t("share_order", "Share")}
      />
      {showCopied && (
        <div className="absolute font-secondary -top-6 left-1/2 transform -translate-x-1/2 bg-secondary text-white text-xs px-1 py-0.5 rounded shadow-lg z-10">
          {t("copied", "Copied")}
        </div>
      )}
    </div>
  );
};
