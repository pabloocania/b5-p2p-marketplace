import React, { useEffect, useState } from "react";
import { Clipboard, Pencil, Send } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";

interface AddressProps {
  address: string;
  isOperation?: boolean;
  showLabel?: boolean;
}

const useAddressSliceLength = () => {
  const [leftSliceLength, setLeftSliceLength] = useState(30);
  useEffect(() => {
    const updateSlice = () => {
      // Tailwind sm breakpoint is 640px
      setLeftSliceLength(window.innerWidth < 640 ? 18 : 30);
    };
    updateSlice();
    window.addEventListener("resize", updateSlice);
    return () => window.removeEventListener("resize", updateSlice);
  }, []);

  return leftSliceLength;
};

const Address: React.FC<AddressProps> = ({
  address,
  isOperation = false,
  showLabel = true,
}) => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const leftSliceLength = useAddressSliceLength();

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
    <div className="w-full space-y-2">
      {/* Primera línea: Título "Dirección" + Botón Send */}
      <div className="flex items-center justify-between">
        {showLabel ? (
          <p className="font-primary text-dark text-xs flex-grow">
            {t("your_address")}
          </p>
        ) : null}
        {!isOperation ? (
          <IconButton
            className="p-2 font-secondary border-primary/50 bg-white h-6 text-primary hover:bg-secondary/20"
            variant="outline"
            size="sm"
            onClick={handleSend}
            icon={Send}
            aria-label="send"
            label={t("send_button")}
          />
        ) : null}
      </div>

      {/* Segunda línea: Address + Botón Copy */}
      <div className="flex items-center justify-between">
        <p className="font-secondary text-dark text-xs flex-grow">
          {address.slice(0, leftSliceLength)}...{address.slice(-4)}
        </p>
        <div className="relative h-full">
          <IconButton
            className="p-2 font-secondary border-primary/50 bg-white h-6 text-primary hover:bg-secondary/20"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            icon={Clipboard}
            aria-label="copy"
            label={t("copy")}
          />
          {/* Feedback visual */}
          {isCopied && (
            <div className="absolute font-secondary -top-6 left-1/2 transform -translate-x-1/2 bg-secondary text-white text-xs rounded shadow-lg z-10">
              {t("copied")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Address;
