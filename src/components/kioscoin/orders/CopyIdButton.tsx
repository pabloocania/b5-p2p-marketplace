import React, { useState } from "react";
import { ClipboardIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

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
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <button
          onClick={handleCopyId}
          className="flex flex-col items-center gap-2 w-full"
        >
          <ClipboardIcon className="w-5 h-5" style={{ color: "#fcce4c" }} />
          <span
            className="text-xs font-medium text-center"
            style={{ color: "#fcce4c" }}
          >
            {t("copy_id")}
          </span>
        </button>
        {showCopied && (
          <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs text-green-600 bg-white px-2 py-1 rounded-md shadow-sm">
            {t("copied")}
          </span>
        )}
      </div>
    </div>
  );
};

export default CopyIdButton;
