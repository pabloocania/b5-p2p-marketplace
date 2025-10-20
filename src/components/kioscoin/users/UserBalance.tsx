"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Wallet, Network } from "lucide-react";
import { CompactSelector } from "./CompactSelector";
import { useTranslation } from "react-i18next";
import { TokenBalance } from "@/components/web3/types";
import { ConfigStore } from "@/lib/ConfigStore";

interface UserBalanceProps {
  balances: TokenBalance[];
  selectedToken: string;
  selectedBlockchain: string;
  onTokenChange: (token: string) => void;
  onBlockchainChange: (blockchain: string) => void;
}

export default function UserBalance({
  balances,
  selectedToken,
  selectedBlockchain,
  onTokenChange,
  onBlockchainChange,
}: UserBalanceProps) {
  const { t } = useTranslation();
  const [availableTokens, setAvailableTokens] = useState<
    Array<{ code: string; name: string; icon: string }>
  >([]);
  const [availableBlockchains, setAvailableBlockchains] = useState<
    Array<{ code: string; name: string; icon: string }>
  >([]);

  // Get available tokens and blockchains from ConfigStore
  useEffect(() => {
    const configStore = ConfigStore.getInstance();

    // Get available tokens
    const backendStablecoins = configStore.getBackendStablecoins();
    if (backendStablecoins?.supportedStablecoins) {
      const tokens = backendStablecoins.supportedStablecoins.map(
        (stablecoin) => {
          // Map tokens to their specific icons
          let icon = "🪙"; // Default icon
          if (stablecoin.name === "USDK") {
            icon = "/criptoicon/usdk.svg";
          } else if (stablecoin.name === "USDC") {
            icon =
              "https://cdn.jsdelivr.net/npm/cryptocurrency-icons/svg/color/usdc.svg";
          } else if (stablecoin.name === "USDT") {
            icon =
              "https://cdn.jsdelivr.net/npm/cryptocurrency-icons/svg/color/usdt.svg";
          }

          return {
            code: stablecoin.name,
            name: stablecoin.name,
            icon: icon,
          };
        }
      );
      setAvailableTokens(tokens);
    }

    // Get available blockchains
    const blockchainNames = configStore.getAllBlockchainNames();
    const blockchains = blockchainNames.map((blockchain) => {
      // Map blockchains to their specific icons
      let icon = "🔗"; // Default icon
      if (
        blockchain === "ARBITRUM_TESTNET" ||
        blockchain === "ARBITRUM_MAINNET"
      ) {
        icon = "/blockchains/arbitrum.svg";
      } else if (blockchain === "BSC_MAINNET") {
        icon = "/blockchains/bnb.svg";
      } else if (blockchain === "POLYGON_MAINNET") {
        icon = "/blockchains/polygon.svg";
      }

      return {
        code: blockchain,
        name: blockchain.replace("_", " "),
        icon: icon,
      };
    });
    setAvailableBlockchains(blockchains);
  }, []);

  // Get current balance for selected token
  const selectedTokenBalance = balances.find((b) => b.name === selectedToken);
  const currentBalance = selectedTokenBalance?.smartWalletBalance || "0";
  const decimals = selectedTokenBalance?.decimals || 18;

  // Format balance using decimals
  const formatBalance = (balance: string, decimals: number): string => {
    try {
      const balanceNumber = parseFloat(balance);
      const formattedBalance = balanceNumber / Math.pow(10, decimals);
      return formattedBalance.toFixed(2);
    } catch (error) {
      return "0.00";
    }
  };

  const formattedBalance = formatBalance(currentBalance, decimals);

  const currentToken = availableTokens.find((t) => t.code === selectedToken) ||
    availableTokens[0] || { code: "USDK", name: "USDK", icon: "🪙" };
  const currentBlockchain = availableBlockchains.find(
    (b) => b.code === selectedBlockchain
  ) ||
    availableBlockchains[0] || {
      code: "BSC_MAINNET",
      name: "BSC MAINNET",
      icon: "🔗",
    };

  return (
    <div className="w-full bg-white rounded-lg border border-secondary/20 p-4 shadow-md">
      {/* <span className="text-xs text-primary font-primary">Balances</span> */}
      {/* Main Balance Section */}
      <div className="flex items-center justify-center gap-10">
        {/* Blockchain Selector (Left) - Compact */}
        <div className="flex justify-start">
          <CompactSelector
            items={availableBlockchains}
            selectedCode={currentBlockchain.code}
            onChange={onBlockchainChange}
            align="start"
            loadingLabel="Loading blockchains..."
            contentClassName="font-primary text-xs p-2"
            buttonAriaLabel="Select blockchain"
          />
        </div>

        {/* Balance (Center) - Fixed width */}
        <div className="flex justify-center">
          <div className="text-center min-w-[80px] sm:min-w-[100px] max-w-[120px] sm:max-w-[140px] font-primary text-dark space-y-1">
            <div className="text-xl sm:text-xl">{formattedBalance}</div>
            <div className="text-xs sm:text-sm text-primary/80">
              {currentToken.code}
            </div>
          </div>
        </div>

        {/* Token Selector (Right) - Compact */}
        <div className="flex justify-end">
          <CompactSelector
            items={availableTokens}
            selectedCode={currentToken.code}
            onChange={onTokenChange}
            align="end"
            loadingLabel="Loading tokens..."
            buttonAriaLabel="Select token"
            contentClassName="font-primary text-xs p-2"
          />
        </div>
      </div>
    </div>
  );
}
