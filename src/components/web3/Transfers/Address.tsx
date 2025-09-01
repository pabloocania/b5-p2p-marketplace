import React, { useState } from "react";
import { Clipboard, RefreshCw, Send } from "lucide-react";
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

  const handleSend = () => {
    // TODO: Implementar funcionalidad de envío
    console.log("Send clicked for address:", address);
  };

  return (
    <div className="w-full space-y-1">
      {/* Primera línea: Título "Dirección" + Botón Send */}
      <div className="flex items-center justify-between">
        <p className="font-secondary text-primary text-sm font-bold">
          {t("address")}
        </p>
        <Button
          className="p-0.5 border-secondary/50 bg-white h-6 w-6"
          variant="outline"
          size="sm"
          onClick={handleSend}
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>

      {/* Segunda línea: Address + Botón Copy */}
      <div className="flex items-center justify-between">
        <p className="font-secondary text-gray-700 text-sm flex-grow">
          {address.slice(0, 30)}...{address.slice(-4)}
        </p>
        <div className="relative ml-2">
          <Button
            className="p-0.5 border-secondary/50 bg-white h-6 w-6"
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            <Clipboard className="h-3 w-3" />
          </Button>
          {/* Feedback visual */}
          {isCopied && (
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-1 py-0.5 rounded shadow-lg z-10">
              ¡Copiado!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Address;
