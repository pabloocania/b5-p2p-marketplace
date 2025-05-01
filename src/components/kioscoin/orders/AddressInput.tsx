import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddressInputProps {
  walletAddress: string;
  setWalletAddress: (address: string) => void;
  orderStatus: string;
}

const AddressInput: React.FC<AddressInputProps> = ({
  walletAddress,
  setWalletAddress,
  orderStatus,
}) => {
  const { t } = useTranslation();
  const [clipboardSupported, setClipboardSupported] = useState(false);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWalletAddress(text);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

  useEffect(() => {
    setClipboardSupported("clipboard" in navigator);
  }, []);

  return (
    <div className="space-y-1">
      <span className="text-xs block font-semibold text-primary text-left">
        {t("take_order_information")}
      </span>
      <div className="flex space-x-2">
        <Input
          id="walletAddress"
          value={walletAddress}
          onChange={(e: any) => setWalletAddress(e.target.value)}
          placeholder={t("insert_wallet_address")}
          className="flex-grow border border-terciary border-opacity-50 text-primary text-xs [&::placeholder]:text-primary [&::placeholder]:text-xs"
          disabled={orderStatus !== "PENDING"}
        />
        {clipboardSupported && (
          <Button
            onClick={handlePasteClipboard}
            variant="outline"
            size="icon"
            title="Paste from clipboard"
            className="border border-terciary border-opacity-50"
          >
            <Clipboard className="h-4 w-4 text-terciary" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddressInput;
