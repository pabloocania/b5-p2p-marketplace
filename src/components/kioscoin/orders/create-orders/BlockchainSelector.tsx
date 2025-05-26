"use client";
import { useTranslation } from "react-i18next";
import { BlockchainName, getBlockchainDisplayName } from "@/lib/ConfigStore";
import { cn } from "@/lib/utils"; // Asegurate de tener esta utilidad para concatenar clases opcionales

interface BlockchainOption {
  blockchain: string;
}

interface BlockchainSelectorProps {
  selectedToken: string;
  selectedBlockchain: string;
  availableBlockchains: BlockchainOption[];
  onBlockchainChange: (blockchain: string) => void;
}

export default function BlockchainSelector({
  selectedToken,
  selectedBlockchain,
  availableBlockchains,
  onBlockchainChange,
}: BlockchainSelectorProps) {
  const { t } = useTranslation();

  if (!selectedToken) return null;

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-sm font-semibold text-primary">
        {t("blockchains")}
      </span>
      <div className="flex flex-wrap gap-2 justify-start">
        {availableBlockchains.map(({ blockchain }) => (
          <button
            key={blockchain}
            type="button"
            onClick={() => onBlockchainChange(blockchain)}
            className={cn(
              "rounded-full border p-2 w-12 h-12 flex items-center justify-center transition",
              selectedBlockchain === blockchain
                ? "bg-primary/10 border-primary"
                : "border-gray-300"
            )}
            aria-label={blockchain}
          >
            {getBlockchainDisplayName(blockchain as BlockchainName)
              .charAt(0)
              .toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
