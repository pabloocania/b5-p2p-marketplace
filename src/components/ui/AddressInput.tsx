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
    <div className="space-y-2">
      <span className="text-xs block font-semibold">
        {t("take_order_information")}
      </span>
      <div className="flex space-x-2">
        <Input
          id="walletAddress"
          value={walletAddress}
          onChange={(e: any) => setWalletAddress(e.target.value)}
          placeholder="Enter wallet address"
          className="flex-grow"
          disabled={orderStatus !== "PENDING"}
        />
        {clipboardSupported && (
          <Button
            onClick={handlePasteClipboard}
            variant="outline"
            size="icon"
            title="Paste from clipboard"
          >
            <Clipboard className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddressInput;
