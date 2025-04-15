import React, { useState } from "react";
import { Clipboard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddressProps {
  address: string;
}

const Address: React.FC<AddressProps> = ({ address }) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="flex items-center w-full">
      <p className="text-terciary text-xs flex-grow">
        {address.slice(0, 30)}...{address.slice(-4)}
      </p>
      <Button
        className="p-1 border-secondary/50 bg-white bo ml-1"
        variant="outline"
        size="link"
        onClick={handleCopy}
      >
        {/* <RefreshCw className="h-4 w-4" /> */}
        <Clipboard className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Address;
