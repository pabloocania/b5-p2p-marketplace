"use client";

import { useCallback, useState } from "react";
import { TokenBalance } from "@/lib/web3/types";
import { ArrowLeftRightIcon, ExternalLinkIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

/**
 * Immutable class representing token selection state
 */
class TokenSelectionState {
  readonly selectedTokenName: string | null;

  private constructor(selectedTokenName: string | null) {
    this.selectedTokenName = selectedTokenName;
  }

  static create(selectedTokenName: string | null = null): TokenSelectionState {
    return new TokenSelectionState(selectedTokenName);
  }

  toggleToken(tokenName: string): TokenSelectionState {
    const newName = this.selectedTokenName === tokenName ? null : tokenName;
    return new TokenSelectionState(newName);
  }

  isSelected(tokenName: string): boolean {
    return this.selectedTokenName === tokenName;
  }
}

interface TokenBalanceMinimalProps {
  balances?: TokenBalance[];
  balanceType: "eoa" | "sw";
  onTokenSelect: (token: TokenBalance | null) => void;
}

export default function TokenBalanceMinimal({
  balances = [],
  balanceType,
  onTokenSelect,
}: TokenBalanceMinimalProps) {
  const [state, setState] = useState<TokenSelectionState>(
    TokenSelectionState.create()
  );

  // Handle token selection
  const handleTokenSelect = useCallback(
    (token: TokenBalance) => {
      const newState = state.toggleToken(token.name);
      setState(newState);

      // Notify parent component
      if (newState.selectedTokenName === token.name) {
        onTokenSelect(token);
      } else {
        onTokenSelect(null);
      }
    },
    [state, onTokenSelect]
  );

  // Format balance with appropriate precision
  const formatBalance = useCallback((balanceStr: string): string => {
    const balance = parseFloat(balanceStr);
    if (balance === 0) return "0";

    // Use exponential notation for very small values
    if (balance < 0.0001) return balance.toExponential(2);

    // Format with appropriate decimal places
    return balance.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  }, []);

  // Display empty state for no balances
  if (!balances || balances.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        No tokens available in this wallet.
      </div>
    );
  }

  // Token icon mapping (using first character as fallback)
  const getTokenSymbol = (tokenName: string) => {
    return tokenName.charAt(0);
  };

  return (
    <div className="space-y-1 py-2">
      <div className="grid grid-cols-4 px-4 text-xs text-muted-foreground">
        <div>Token</div>
        <div className="text-right">Balance</div>
        <div className="text-right">Value</div>
        <div className="text-center">Action</div>
      </div>

      <Separator />

      {balances.map((token, index) => {
        const balance =
          balanceType === "eoa" ? token.eoaBalance : token.smartWalletBalance;
        const numericBalance = parseFloat(balance);
        const hasBalance = numericBalance > 0;
        const isSelected = state.isSelected(token.name);

        // Dummy USD value calculation (would come from real data)
        const dummyUsdValue =
          token.name === "ETH" ? numericBalance * 3500 : numericBalance;

        return (
          <div key={index}>
            <div
              className={`
                grid grid-cols-4 items-center px-4 py-3 
                ${
                  hasBalance
                    ? "hover:bg-primary/5 cursor-pointer"
                    : "opacity-60"
                }
                ${isSelected ? "bg-primary/5" : ""}
              `}
              onClick={() => hasBalance && handleTokenSelect(token)}
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center 
                  font-bold text-white
                  ${token.name === "USDC" ? "bg-blue-500" : ""}
                  ${token.name === "USDT" ? "bg-green-500" : ""}
                  ${token.name === "USDK" ? "bg-purple-500" : ""}
                  ${token.name === "ETH" ? "bg-gray-700" : ""}
                  ${
                    !["USDC", "USDT", "USDK", "ETH"].includes(token.name)
                      ? "bg-primary"
                      : ""
                  }
                `}
                >
                  {getTokenSymbol(token.name)}
                </div>
                <span className="font-medium">{token.name}</span>
              </div>

              <div className="text-right font-mono">
                {formatBalance(balance)}
              </div>

              <div className="text-right font-mono text-muted-foreground">
                $
                {dummyUsdValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>

              <div className="flex justify-center">
                {hasBalance ? (
                  <button
                    className={`
                      p-1.5 rounded-full transition-colors
                      ${
                        isSelected
                          ? "bg-primary text-white"
                          : "text-primary hover:bg-primary/10"
                      }
                    `}
                    aria-label={`Transfer ${token.name}`}
                  >
                    <ArrowLeftRightIcon className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground px-2">
                    Empty
                  </span>
                )}
              </div>
            </div>

            {index < balances.length - 1 && <Separator />}
          </div>
        );
      })}

      {/* Add a show all button at the bottom */}
      <div className="pt-2 text-center">
        <a
          href="#"
          className="text-xs text-primary flex items-center justify-center hover:underline"
          onClick={(e) => e.preventDefault()}
        >
          View all tokens
          <ExternalLinkIcon className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  );
}
