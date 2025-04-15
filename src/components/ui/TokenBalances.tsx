"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TokenBalance } from "@/lib/web3/types";
import { ArrowLeftRightIcon, CoinsIcon, ChevronRight } from "lucide-react";

/**
 * Immutable class for token display state
 */
class TokenDisplayState {
  readonly selectedTokenName: string | null;

  private constructor(selectedTokenName: string | null) {
    this.selectedTokenName = selectedTokenName;
  }

  static create(selectedTokenName: string | null = null): TokenDisplayState {
    return new TokenDisplayState(selectedTokenName);
  }

  withSelectedToken(tokenName: string | null): TokenDisplayState {
    return new TokenDisplayState(tokenName);
  }

  isSelected(tokenName: string): boolean {
    return this.selectedTokenName === tokenName;
  }
}

interface TokenBalanceListProps {
  balances?: TokenBalance[];
  balanceType: "eoa" | "sw";
  onTokenSelect: (token: TokenBalance | null) => void;
}

export default function TokenBalanceList({
  balances = [],
  balanceType,
  onTokenSelect,
}: TokenBalanceListProps) {
  const [displayState, setDisplayState] = useState<TokenDisplayState>(
    TokenDisplayState.create()
  );

  const handleTokenClick = (token: TokenBalance) => {
    const newSelectedTokenName = displayState.isSelected(token.name)
      ? null
      : token.name;
    const newDisplayState =
      displayState.withSelectedToken(newSelectedTokenName);
    setDisplayState(newDisplayState);

    // Pass the full token object or null to the parent component
    const selectedToken = newSelectedTokenName ? token : null;
    onTokenSelect(selectedToken);
  };

  // Helper function to format balance with appropriate precision
  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num === 0) return "0.00";
    if (num < 0.01) return num.toExponential(2);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  // For empty states
  if (balances.length === 0) {
    return (
      <Card className="w-full border-none max-w-md mx-auto bg-transparent">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CoinsIcon className="h-12 w-12 text-muted-foreground opacity-50 mb-2" />
          <p className="text-center text-muted-foreground">
            No token balances to display.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-none max-w-md mx-auto bg-transparent">
      <CardContent className="px-0">
        <div className="grid grid-cols-1 gap-2">
          {balances.map((token, index) => {
            const balance =
              balanceType === "eoa"
                ? token.eoaBalance
                : token.smartWalletBalance;
            const isSelected = displayState.isSelected(token.name);
            const hasBalance = parseFloat(balance) > 0;

            return (
              <div key={index} className="w-full">
                <div
                  className={`
                    p-3 rounded-lg transition-all 
                    ${
                      isSelected
                        ? "bg-primary/5 border border-primary/10"
                        : "bg-transparent"
                    } 
                    ${
                      hasBalance
                        ? "cursor-pointer hover:bg-primary/5"
                        : "opacity-70"
                    }
                  `}
                  onClick={() => hasBalance && handleTokenClick(token)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`
                        w-10 h-10 rounded-full flex items-center justify-center 
                        ${hasBalance ? "bg-primary/10" : "bg-muted/50"}
                      `}
                      >
                        <span className="text-lg font-bold text-primary">
                          {token.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary text-base">
                          {token.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {balanceType === "eoa"
                            ? "External Wallet"
                            : "Smart Wallet"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="text-right mr-2">
                        <p className="font-mono font-medium text-primary">
                          {formatBalance(balance)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hasBalance ? "Available" : "No balance"}
                        </p>
                      </div>

                      {hasBalance && (
                        <div
                          className={`
                            rounded-full w-8 h-8 flex items-center justify-center
                            ${
                              isSelected
                                ? "bg-primary text-white"
                                : "bg-primary/10 text-primary"
                            }
                          `}
                        >
                          {isSelected ? (
                            <ChevronRight className="h-4 w-4" />
                          ) : (
                            <ArrowLeftRightIcon className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional: Add an animated expansion panel for selected token info */}
                {isSelected && (
                  <div className="px-3 py-2 text-xs text-muted-foreground animate-fadeIn">
                    <p>Select an amount to transfer this token</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
