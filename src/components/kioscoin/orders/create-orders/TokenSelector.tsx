import React, { useState, useEffect } from "react";

import { ConfigStore } from "@/lib/ConfigStore";
import { useTranslation } from "react-i18next";
import { StablecoinConfig } from "@/components/web3/types";
import { CryptoAmountIcon } from "@/components/kioscoin/CryptoIcon";

interface Blockchain {
  name: string;
  supportedCoins: string[];
}

interface TokenSelectorProps {
  onTokenChange: (token: string) => void;
  onBlockchainChange: (blockchain: string) => void;
  preSelectedToken?: string;
  preSelectedBlockchain?: string;
}

export const TokenSelector: React.FC<TokenSelectorProps> = React.memo(
  ({
    onTokenChange,
    onBlockchainChange,
    preSelectedToken,
    preSelectedBlockchain,
  }) => {
    const [blockchains, setBlockchains] = useState<Blockchain | undefined>(
      undefined
    );
    const [stablecoinConfig, setStablecoinConfig] = useState<
      StablecoinConfig | undefined
    >(undefined);
    const [selectedToken, setSelectedToken] = useState<string>(
      preSelectedToken || ""
    );
    const [selectedBlockchain, setSelectedBlockchain] = useState<string>(
      preSelectedBlockchain || ""
    );
    const { t } = useTranslation();

    useEffect(() => {
      const backendStablecoinsConfig =
        ConfigStore.getInstance().getBackendStablecoins();
      if (backendStablecoinsConfig) {
        setStablecoinConfig(backendStablecoinsConfig);
      }
    }, []);

    useEffect(() => {
      if (preSelectedToken) {
        setSelectedToken(preSelectedToken);
        onTokenChange(preSelectedToken);
      }
      if (preSelectedBlockchain) {
        setSelectedBlockchain(preSelectedBlockchain);
        onBlockchainChange(preSelectedBlockchain);
      }
    }, [preSelectedToken, preSelectedBlockchain]);

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

    const tokens = stablecoinConfig
      ? getUniqueTokenNames(stablecoinConfig)
      : [];

    const handleTokenChange = (e: React.MouseEvent, value: string) => {
      e.stopPropagation();
      e.preventDefault();
      setSelectedToken(value);
      setSelectedBlockchain("");
      onTokenChange(value);
    };

  

    const availableBlockchains = stablecoinConfig
      ? stablecoinConfig.supportedStablecoins
          .filter((stablecoin) => stablecoin.name === selectedToken)
          .flatMap((v) => v.addresses)
      : [];

    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Stablecoin as buttons */}
        <div className="flex flex-wrap gap-2 justify-start">
          {tokens.map((token) => (
            <button
              key={token}
              onClick={(e) => handleTokenChange(e, token)}
              className={`rounded-full border p-2 w-12 h-12 flex items-center justify-center transition
                ${
                  selectedToken === token
                    ? "bg-primary/10 border-primary"
                    : "border-gray-300"
                }`}
              aria-label={token}
            >
              <CryptoAmountIcon tokenCode={token} showAmount={false} />
            </button>
          ))}
        </div>

        {/* Blockchain dropdown */}
      </div>
    );
  }
);

export default TokenSelector;
