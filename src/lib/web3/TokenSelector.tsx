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
import { Stablecoin, StablecoinConfig } from "./types";

interface Blockchain {
  name: string;
  supportedCoins: string[];
}

interface TokenSelectorProps {
  onTokenChange: (token: string) => void;
  onBlockchainChange: (blockchain: string) => void;
}

export const TokenSelector: React.FC<TokenSelectorProps> = React.memo(
  ({ onTokenChange, onBlockchainChange }) => {
    const [blockchains, setBlockchains] = useState<Blockchain | undefined>(
      undefined
    );
    const [stablecoinConfig, setStablecoinConfig] = useState<
      StablecoinConfig | undefined
    >(undefined);
    const [selectedToken, setSelectedToken] = useState<string>("");
    const [selectedBlockchain, setSelectedBlockchain] = useState<string>("");
    const { t } = useTranslation();

    useEffect(() => {
      const backendStablecoinsConfig =
        ConfigStore.getInstance().getBackendStablecoins();
      if (backendStablecoinsConfig) {
        setStablecoinConfig(backendStablecoinsConfig);
      }
    }, []);

    // Helper function to get unique tokens
    const getUniqueTokenNames = (
      stablecoinConfig: StablecoinConfig
    ): string[] => {
      if (
        !stablecoinConfig ||
        !Array.isArray(stablecoinConfig.supportedStablecoins)
      ) {
        return [];
      }

      const tokenNames = stablecoinConfig.supportedStablecoins.map(
        (stablecoin) => stablecoin.name
      );
      return Array.from(new Set(tokenNames));
    };

    // Get unique token names
    const tokens = stablecoinConfig
      ? getUniqueTokenNames(stablecoinConfig)
      : [];

    const handleTokenChange = (value: string) => {
      setSelectedToken(value);
      setSelectedBlockchain(""); // Reset blockchain selection on token change
      onTokenChange(value); // Notify parent component
    };

    const handleBlockchainChange = (value: string) => {
      setSelectedBlockchain(value);
      onBlockchainChange(value); // Notify parent component
    };

    const availableBlockchains = stablecoinConfig
      ? stablecoinConfig.supportedStablecoins
          .filter((stablecoin) => stablecoin.name === selectedToken)
          .flatMap((v) => v.addresses)
      : [];

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
                  <SelectItem
                    key={blockchain.blockchain}
                    value={blockchain.blockchain}
                  >
                    {getBlockchainDisplayName(
                      blockchain.blockchain as BlockchainName
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  }
);

export default TokenSelector;
