import React, { useState } from "react";
import { Clipboard } from "lucide-react";

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
    <div className="flex items-center w-full pb-4">
      <p
        className="text-primary text-sm flex-grow"
        style={{ flexBasis: "93%" }}
      >
        {address.slice(0, 25)}...{address.slice(-4)}
      </p>
      <button
        onClick={handleCopy}
        className={`${
          isCopied ? "text-secondary" : "text-primary hover:text-blue-600"
        } ml-auto flex justify-end`}
        style={{ flexBasis: "7%" }}
        aria-label="Copy address"
      >
        <Clipboard className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Address;
