import React, { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Adjust as needed
import { ConfigStore, getBlockchainDisplayName } from "@/lib/ConfigStore";
import { useTranslation } from "react-i18next";
import { BlockchainName } from "./PublicClientManager";

interface Blockchain {
  name: string;
  supportedCoins: string[];
}

interface TokenSelectorProps {
  onTokenChange: (token: string) => void;
  onBlockchainChange: (blockchain: string) => void;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  onTokenChange,
  onBlockchainChange,
}) => {
  const [blockchains, setBlockchains] = useState<Blockchain[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>("");
  const { t } = useTranslation();

  useEffect(() => {
    const config = ConfigStore.getInstance().getConfig();
    if (config) {
      setBlockchains(config.config.blockchains);
    }
  }, []);

  // Create a unique list of tokens from all blockchains
  const tokens = Array.from(
    new Set(blockchains.flatMap((b) => b.supportedCoins))
  );

  const handleTokenChange = (value: string) => {
    setSelectedToken(value);
    setSelectedBlockchain(""); // Reset blockchain selection on token change
    onTokenChange(value); // Notify parent component
  };

  const handleBlockchainChange = (value: string) => {
    setSelectedBlockchain(value);
    onBlockchainChange(value); // Notify parent component
  };

  // Filter blockchains that support the selected token
  const availableBlockchains = blockchains.filter((b) =>
    b.supportedCoins.includes(selectedToken)
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Token Selector */}
      <div>
        <Select onValueChange={handleTokenChange} required>
          <SelectTrigger>
            <SelectValue placeholder={t("select_token")} />
          </SelectTrigger>
          <SelectContent>
            {tokens.map((token) => (
              <SelectItem key={token} value={token}>
                {token}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Nested Blockchain Selector, styled as a nested element */}
      {selectedToken && (
        <div
          style={{
            marginLeft: "1rem",
            borderLeft: "2px solid #ccc",
            paddingLeft: "1rem",
          }}
        >
          <Select onValueChange={handleBlockchainChange} required>
            <SelectTrigger>
              <SelectValue placeholder={t("select_blockchain")} />
            </SelectTrigger>
            <SelectContent>
              {availableBlockchains.map((blockchain) => (
                <SelectItem key={blockchain.name} value={blockchain.name}>
                  {getBlockchainDisplayName(blockchain.name as BlockchainName)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
