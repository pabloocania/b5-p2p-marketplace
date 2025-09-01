"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Wallet, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [isTokenOpen, setIsTokenOpen] = useState(false);
  const [isBlockchainOpen, setIsBlockchainOpen] = useState(false);
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
    <div className="max-w-md mx-auto bg-white rounded-lg border border-secondary/20 p-2 sm:p-4 shadow-sm">
      {/* Main Balance Section */}
      <div className="flex items-center justify-between">
        {/* Token Selector (Left) - Compact */}
        <div className="flex justify-start">
          <Popover open={isTokenOpen} onOpenChange={setIsTokenOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 bg-secondary/10 border-secondary/30 hover:bg-secondary/20 px-2 py-1"
              >
                {currentToken.icon.startsWith("/") ||
                currentToken.icon.startsWith("http") ? (
                  <img
                    src={currentToken.icon}
                    alt={currentToken.code}
                    className="w-4 h-4"
                  />
                ) : (
                  <span className="text-sm">{currentToken.icon}</span>
                )}
                <ChevronDown className="h-3 w-3 text-primary" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48">
              {availableTokens.length > 0 ? (
                availableTokens.map((token) => (
                  <button
                    key={token.code}
                    onClick={() => {
                      onTokenChange(token.code);
                      setIsTokenOpen(false);
                    }}
                    className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-md"
                  >
                    {token.icon.startsWith("/") ||
                    token.icon.startsWith("http") ? (
                      <img
                        src={token.icon}
                        alt={token.code}
                        className="w-5 h-5"
                      />
                    ) : (
                      <span className="text-lg">{token.icon}</span>
                    )}
                    <span className="font-medium">{token.name}</span>
                  </button>
                ))
              ) : (
                <div className="p-2 text-gray-500">Loading tokens...</div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Balance (Center) - Fixed width */}
        <div className="flex-1 flex justify-center">
          <div className="text-center min-w-[100px] sm:min-w-[120px] max-w-[180px] sm:max-w-[200px]">
            <div className="text-xl sm:text-2xl font-bold text-black">
              {formattedBalance}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {currentToken.code}
            </div>
          </div>
        </div>

        {/* Blockchain Selector (Right) - Compact */}
        <div className="flex justify-end">
          <Popover open={isBlockchainOpen} onOpenChange={setIsBlockchainOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 bg-secondary/10 border-secondary/30 hover:bg-secondary/20 px-2 py-1"
              >
                {currentBlockchain.icon.startsWith("/") ||
                currentBlockchain.icon.startsWith("http") ? (
                  <img
                    src={currentBlockchain.icon}
                    alt={currentBlockchain.code}
                    className="w-4 h-4"
                  />
                ) : (
                  <span className="text-sm">{currentBlockchain.icon}</span>
                )}
                <ChevronDown className="h-3 w-3 text-primary" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48">
              {availableBlockchains.length > 0 ? (
                availableBlockchains.map((blockchain) => (
                  <button
                    key={blockchain.code}
                    onClick={() => {
                      onBlockchainChange(blockchain.code);
                      setIsBlockchainOpen(false);
                    }}
                    className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-md"
                  >
                    {blockchain.icon.startsWith("/") ||
                    blockchain.icon.startsWith("http") ? (
                      <img
                        src={blockchain.icon}
                        alt={blockchain.code}
                        className="w-5 h-5"
                      />
                    ) : (
                      <span className="text-lg">{blockchain.icon}</span>
                    )}
                    <span className="font-medium">{blockchain.name}</span>
                  </button>
                ))
              ) : (
                <div className="p-2 text-gray-500">Loading blockchains...</div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
