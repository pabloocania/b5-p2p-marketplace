"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TokenBalance } from "@/components/web3/types";
import { ArrowLeftRightIcon, ChevronRightIcon, WalletIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CryptoAmountIcon } from "./CryptoIcon";
import InternalTransferAmountInput from "@/components/web3/Transfers/TransferComponent";
import { formatTokenAmount } from "@/lib/utils";
/**
 * Immutable data class for token card state
 */
class TokenCardState {
  readonly selectedTokenId: string | null;

  private constructor(selectedTokenId: string | null) {
    this.selectedTokenId = selectedTokenId;
  }

  static create(selectedTokenId: string | null = null): TokenCardState {
    return new TokenCardState(selectedTokenId);
  }

  withSelectedToken(tokenId: string | null): TokenCardState {
    return new TokenCardState(tokenId);
  }

  isSelected(tokenName: string): boolean {
    return this.selectedTokenId === tokenName;
  }
}

interface TokenBalanceCardListProps {
  balances?: TokenBalance[];
  balanceType: "eoa" | "sw";
  onTokenSelect: (token: TokenBalance | null) => void;
  handleTransfer: (transferAmount: string) => void;
}

export default function TokenBalanceCardList({
  balances = [],
  balanceType,
  onTokenSelect,
  handleTransfer,
}: TokenBalanceCardListProps) {
  const [state, setState] = useState<TokenCardState>(TokenCardState.create());

  const handleSelectToken = (token: TokenBalance) => {
    const isCurrentlySelected = state.isSelected(token.name);
    const newState = isCurrentlySelected
      ? state.withSelectedToken(null)
      : state.withSelectedToken(token.name);

    setState(newState);
    onTokenSelect(isCurrentlySelected ? null : token);
  };

  // For empty state
  if (balances.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-3">
        <WalletIcon className="h-12 w-12 text-muted-foreground opacity-50" />
        <p className="text-center text-muted-foreground">No tokens available</p>
      </div>
    );
  }

  // Find the selected token
  const selectedToken =
    balances.find((token) => state.isSelected(token.name)) || null;

  // Sort balances to show tokens with balance first
  const sortedBalances = [...balances].sort((a, b) => {
    const balanceA = parseFloat(
      balanceType === "eoa" ? a.eoaBalance : a.smartWalletBalance
    );
    // console.log(balanceA);
    const balanceB = parseFloat(
      balanceType === "eoa" ? b.eoaBalance : b.smartWalletBalance
    );
    // console.log(balanceB);
    return balanceB - balanceA; // Descending order
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {sortedBalances.map((token, index) => {
          const balance =
            balanceType === "eoa" ? token.eoaBalance : token.smartWalletBalance;
          const hasBalance = parseFloat(balance) > 0;
          const isSelected = state.isSelected(token.name);

          // Return full card for tokens with balance
          if (hasBalance) {
            return (
              <Card
                key={index}
                className={`
                  overflow-hidden transition-all duration-200 ease-in-out shadow
                  ${isSelected ? "ring-2 ring-primary" : "hover:shadow-lg"}
                `}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => handleSelectToken(token)}
                >
                  <CardContent className="p-2">
                    {/* Wallet badge and transfer button */}
                    <div className="flex justify-between items-center">
                      <Badge
                        variant="outline"
                        className="py-1 px-2 flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 border-green-200"
                      >
                        <WalletIcon className="h-3 w-3" />
                        {balanceType === "eoa" ? "EOA Wallet" : "Smart Wallet"}
                      </Badge>

                      <button
                        className={`
                          rounded-full w-8 h-8 flex items-center justify-center transition-colors
                          ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          }
                        `}
                        aria-label="Transfer token"
                      >
                        {isSelected ? (
                          <ChevronRightIcon className="h-5 w-5" />
                        ) : (
                          <ArrowLeftRightIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Token amount and icon */}
                    <div className="mt-2 pb-1 text-center w-full flex justify-center">
                      <CryptoAmountIcon
                        tokenCode={token.name}
                        formattedAmount={formatTokenAmount(
                          balance,
                          token.decimals
                        )}
                        showAmount={true}
                        textSizeClass="text-lg"
                        decimals={token.decimals}
                      />
                    </div>

                    {/* Transfer component */}
                    {isSelected && (
                      <div
                        className="mt-4 pt-3 border-t"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InternalTransferAmountInput
                          selectedToken={selectedToken}
                          handleTransfer={handleTransfer}
                          isEOA={balanceType === "eoa"}
                        />
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            );
          }

          // Return minimal design for tokens without balance
          return (
            <Card
              key={index}
              className="overflow-hidden transition-all duration-200 ease-in-out bg-white/60 border-gray-100 opacity-70"
            >
              <CardContent className="p-2">
                <div className="flex flex-col items-center">
                  <CryptoAmountIcon
                    decimals={token.decimals}
                    tokenCode={token.name}
                    formattedAmount={"0"}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
