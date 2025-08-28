import React, { useState } from "react";
import { Clipboard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface AddressProps {
  address: string;
}

const Address: React.FC<AddressProps> = ({ address }) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="w-full">
      <p className="font-bold text-primary text-xs mb-1">{t("address")}</p>
      <div className="flex items-center w-full">
        <p className="text-terciary text-xs flex-grow">
          {address.slice(0, 30)}...{address.slice(-4)}
        </p>
        <div className="relative">
          <Button
            className="p-1 border-secondary/50 bg-white bo ml-1"
            variant="outline"
            size="link"
            onClick={handleCopy}
          >
            {/* <RefreshCw className="h-4 w-4" /> */}
            <Clipboard className="h-4 w-4" />
          </Button>
          {/* Feedback visual simple y localizado */}
          {isCopied && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
              ¡Copiado!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Address;
