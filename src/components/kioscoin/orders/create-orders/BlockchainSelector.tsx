"use client";
import { useTranslation } from "react-i18next";
import { BlockchainName, getBlockchainDisplayName } from "@/lib/ConfigStore";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface BlockchainOption {
  blockchain: string;
}

interface BlockchainSelectorProps {
  selectedToken: string;
  selectedBlockchain: string;
  availableBlockchains: BlockchainOption[];
  onBlockchainChange: (blockchain: string) => void;
}

const blockchainIconMap: Record<string, string> = {
  ethereum: "eth.svg",
  eth: "eth.svg",
  "ethereum mainnet": "eth.svg",

  "binance smart chain": "bnb.svg",
  "bnb chain": "bnb.svg",
  bsc: "bnb.svg",
  binance: "bnb.svg",

  polygon: "polygon.svg",
  "polygon mainnet": "polygon.svg",
  matic: "polygon.svg",

  arbitrum: "arbitrum.svg",
  "arbitrum one": "arbitrum.svg",
  "arbitrum sepolia": "arbitrum.svg",

  base: "base.webp",
};

export default function BlockchainSelector({
  selectedToken,
  selectedBlockchain,
  availableBlockchains,
  onBlockchainChange,
}: BlockchainSelectorProps) {
  const { t } = useTranslation();

  if (!selectedToken) return null;

  return (
    <div className="w-full space-y-2 font-secondary">
      <div className="flex flex-wrap gap-2 justify-start">
        {availableBlockchains.map(({ blockchain }) => {
          const normalized = blockchain.toLowerCase();
          const matchedKey = Object.keys(blockchainIconMap).find((key) =>
            normalized.includes(key)
          );
          const iconFile = matchedKey
            ? blockchainIconMap[matchedKey]
            : undefined;

          return (
            <button
              key={blockchain}
              type="button"
              onClick={() => onBlockchainChange(blockchain)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-2 transition",
                selectedBlockchain === blockchain
                  ? "bg-primary/10 border-primary text-primary"
                  : "border-gray-300 text-muted-foreground hover:bg-accent"
              )}
            >
              {iconFile && (
                <img
                  src={`/blockchains/${iconFile}`}
                  alt={blockchain}
                  className="w-5 h-5"
                />
              )}
              <span className="text-sm font-medium">
                {getBlockchainDisplayName(blockchain as BlockchainName)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
