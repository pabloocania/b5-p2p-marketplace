import React, { useState } from "react";
import { Clipboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/components/ui/IconButton";

interface CopyIdButtonProps {
  orderId?: string;
}

const CopyIdButton: React.FC<CopyIdButtonProps> = ({ orderId }) => {
  const { t } = useTranslation();
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyId = async () => {
    if (orderId) {
      await navigator.clipboard.writeText(orderId);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center relative w-full">
      {/* <IconButton
        icon={ClipboardIcon}
        className="font-secondary border-primary/50 bg-white text-primary hover:bg-secondary/20 w-full justify-center"
        label={t("copy_id")}
        size="sm"
        variant="outline"
        onClick={handleCopyId}
      /> */}
      <IconButton
        className="p-2 font-secondary border-primary/50 bg-white text-primary hover:bg-secondary/20 w-full justify-center"
        variant="outline"
        size="sm"
        onClick={handleCopyId}
        icon={Clipboard}
        aria-label="copy"
        label={t("copy_id")}
      />
      {showCopied && (
        <div className="absolute font-secondary -top-6 left-1/2 transform -translate-x-1/2 bg-secondary text-white text-xs px-1 py-0.5 rounded shadow-lg z-10">
          {t("copied")}
        </div>
      )}
    </div>
  );
};

export default CopyIdButton;
