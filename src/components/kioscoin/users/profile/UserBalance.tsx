"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, Wallet, Network, RefreshCw } from "lucide-react";
import { CompactSelector } from "./CompactSelector";
import { useTranslation } from "react-i18next";
import { TokenBalance } from "@/components/web3/types";
import { ConfigStore } from "@/lib/ConfigStore";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";

// Mainnet blockchains in priority order
const MAINNET_BLOCKCHAINS = [
  "BSC_MAINNET",
  "POLYGON_MAINNET",
  "ARBITRUM_MAINNET",
  "BASE_MAINNET",
  "RSK_MAIN",
] as const;

// Testnet blockchains in priority order (ARBITRUM_TESTNET as fallback)
const TESTNET_BLOCKCHAINS = [
  "BASE_SEPOLIA",
  "ARBITRUM_TESTNET",
  "RSK_TESTNET",
] as const;

// Default fallback blockchain
export const DEFAULT_BLOCKCHAIN = "ARBITRUM_TESTNET";

export const isMainnet = (blockchain: string): boolean =>
  MAINNET_BLOCKCHAINS.includes(
    blockchain as (typeof MAINNET_BLOCKCHAINS)[number]
  );

/**
 * Determines the best blockchain to select based on precedence:
 * 1. First priority: Mainnets with balance > 0
 * 2. Second priority: Testnets with balance > 0
 * 3. Fallback: ARBITRUM_TESTNET
 */
export interface BlockchainWithBalance {
  blockchain: string;
  hasBalance: boolean;
}

export const selectBestBlockchain = (
  blockchainsWithBalance: BlockchainWithBalance[]
): string => {
  // Separate mainnets and testnets
  const mainnetsWithBalance = blockchainsWithBalance.filter(
    (b) => isMainnet(b.blockchain) && b.hasBalance
  );
  const testnetsWithBalance = blockchainsWithBalance.filter(
    (b) => !isMainnet(b.blockchain) && b.hasBalance
  );

  // Priority 1: Mainnet with balance
  if (mainnetsWithBalance.length > 0) {
    // Return the mainnet with highest priority
    for (const mainnet of MAINNET_BLOCKCHAINS) {
      const found = mainnetsWithBalance.find((b) => b.blockchain === mainnet);
      if (found) return found.blockchain;
    }
  }

  // Priority 2: Testnet with balance
  if (testnetsWithBalance.length > 0) {
    // Return the testnet with highest priority
    for (const testnet of TESTNET_BLOCKCHAINS) {
      const found = testnetsWithBalance.find((b) => b.blockchain === testnet);
      if (found) return found.blockchain;
    }
    return testnetsWithBalance[0].blockchain;
  }

  // Fallback: ARBITRUM_TESTNET
  return DEFAULT_BLOCKCHAIN;
};

/**
 * Check if a balance array has any token with balance > 0
 */
export const hasPositiveBalance = (balances: TokenBalance[]): boolean => {
  return balances.some((balance) => {
    const balanceValue = parseFloat(balance.smartWalletBalance || "0");
    return balanceValue > 0;
  });
};

/**
 * Find the first token with positive balance (> 0)
 * Returns the token name or undefined if no token has positive balance
 */
export const findTokenWithPositiveBalance = (
  balances: TokenBalance[]
): string | undefined => {
  const tokenWithBalance = balances.find((balance) => {
    const balanceValue = parseFloat(balance.smartWalletBalance || "0");
    return balanceValue > 0;
  });
  return tokenWithBalance?.name;
};

const getBlockchainIcon = (blockchain: string): string => {
  if (blockchain === "ARBITRUM_TESTNET" || blockchain === "ARBITRUM_MAINNET") {
    return "/blockchains/arbitrum.svg";
  } else if (blockchain === "BSC_MAINNET") {
    return "/blockchains/bnb.svg";
  } else if (blockchain === "POLYGON_MAINNET") {
    return "/blockchains/polygon.svg";
  } else if (blockchain === "BASE_SEPOLIA" || blockchain === "BASE_MAINNET") {
    return "/blockchains/base.svg";
  }
  return "🔗";
};

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
  const { refreshBalances, isLoading: isSdkLoading } = useEtherspotSdk();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<
    Array<{ code: string; name: string; icon: string }>
  >([]);
  const [availableBlockchains, setAvailableBlockchains] = useState<
    Array<{ code: string; name: string; icon: string }>
  >([]);

  // Sort blockchains: mainnets first, then testnets
  const sortBlockchainsByPrecedence = useCallback(
    (blockchainNames: string[]) => {
      return [...blockchainNames].sort((a, b) => {
        const aIsMainnet = isMainnet(a);
        const bIsMainnet = isMainnet(b);

        // Mainnets come first
        if (aIsMainnet && !bIsMainnet) return -1;
        if (!aIsMainnet && bIsMainnet) return 1;

        // Within same category, maintain order based on priority arrays
        if (aIsMainnet && bIsMainnet) {
          const aIndex = MAINNET_BLOCKCHAINS.indexOf(
            a as (typeof MAINNET_BLOCKCHAINS)[number]
          );
          const bIndex = MAINNET_BLOCKCHAINS.indexOf(
            b as (typeof MAINNET_BLOCKCHAINS)[number]
          );
          return aIndex - bIndex;
        }

        // For testnets
        const aIndex = TESTNET_BLOCKCHAINS.indexOf(
          a as (typeof TESTNET_BLOCKCHAINS)[number]
        );
        const bIndex = TESTNET_BLOCKCHAINS.indexOf(
          b as (typeof TESTNET_BLOCKCHAINS)[number]
        );
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    },
    []
  );

  // Get available blockchains from ConfigStore (only once on mount)
  useEffect(() => {
    const configStore = ConfigStore.getInstance();

    // Get available blockchains and sort by precedence
    const blockchainNames = configStore.getAllBlockchainNames();
    const sortedBlockchainNames = sortBlockchainsByPrecedence(blockchainNames);

    const blockchains = sortedBlockchainNames.map((blockchain) => ({
      code: blockchain,
      name: blockchain.replace("_", " "),
      icon: getBlockchainIcon(blockchain),
    }));

    setAvailableBlockchains(blockchains);
  }, [sortBlockchainsByPrecedence]);

  // Update available tokens when blockchain changes
  useEffect(() => {
    if (!selectedBlockchain) return;

    const configStore = ConfigStore.getInstance();

    // Get tokens available on the selected blockchain
    const stablecoinsForBlockchain =
      configStore.getStablecoinsByBlockchain(selectedBlockchain);

    const tokens = stablecoinsForBlockchain.map((stablecoin) => {
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
    });

    setAvailableTokens(tokens);
  }, [selectedBlockchain]);

  // Handle balance refresh
  const handleRefreshBalances = async () => {
    if (isRefreshing || isSdkLoading) return;

    setIsRefreshing(true);
    try {
      await refreshBalances();
    } catch (error) {
      console.error("Failed to refresh balances:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
        <div className="flex flex-col items-center justify-center">
          {/* Refresh Button */}
          <button
            onClick={handleRefreshBalances}
            disabled={isRefreshing || isSdkLoading}
            className="mb-1 pb-1 rounded-full hover:bg-secondary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Refresh balance"
          >
            <RefreshCw
              className={`w-5 h-5 text-primary ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          {/* Balance Display */}
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
