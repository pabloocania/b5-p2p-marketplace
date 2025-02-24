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
    <div className="flex items-center w-full">
      <p className="text-terciary text-xs flex-grow">
        {address.slice(0, 30)}...{address.slice(-4)}
      </p>
      <button
        onClick={handleCopy}
        className={`${
          isCopied ? "text-secondary" : "text-primary hover:text-blue-600"
        } ml-auto flex-none rounded-full bg-secondary`}
        aria-label="Copy address"
      >
        <Clipboard className="h-5 w-5 p-1 text-white" />
      </button>
    </div>
  );
};

export default Address;
