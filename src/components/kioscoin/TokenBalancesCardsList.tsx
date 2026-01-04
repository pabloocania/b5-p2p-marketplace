"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TokenBalance } from "@/components/web3/types";
import { ArrowLeftRightIcon, ChevronRightIcon, WalletIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CryptoAmountIcon } from "./CryptoIcon";
import InternalTransferAmountInput from "@/components/web3/Transfers/TransferComponent";
import { formatTokenAmount } from "@/lib/utils";
import { useTranslation } from "react-i18next";
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
  onTokenSelect: (token: TokenBalance | null) => void;
  handleTransfer: (transferAmount: string) => void;
  hideEmptyBalances?: boolean; // New flag to hide zero balances
}

export default function TokenBalanceCardList({
  balances = [],
  onTokenSelect,
  handleTransfer,
  hideEmptyBalances = false, // Default to false
}: TokenBalanceCardListProps) {
  const [state, setState] = useState<TokenCardState>(TokenCardState.create());
  const { t } = useTranslation();
  // Filter out zero balances if hideEmptyBalances is true
  const filteredBalances = hideEmptyBalances
    ? balances.filter((token) => parseFloat(token.smartWalletBalance) > 0)
    : balances;

  const handleSelectToken = (token: TokenBalance) => {
    const isCurrentlySelected = state.isSelected(token.name);
    const newState = isCurrentlySelected
      ? state.withSelectedToken(null)
      : state.withSelectedToken(token.name);

    setState(newState);
    onTokenSelect(isCurrentlySelected ? null : token);
  };

  // For empty state
  if (filteredBalances.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-3 font-secondary text-dark">
        <WalletIcon className="h-12 w-12 text-dark opacity-50" />
        <p className="text-center text-dark">{t("no_stablecoins_available")}</p>
      </div>
    );
  }

  // Find the selected token
  const selectedToken =
    filteredBalances.find((token) => state.isSelected(token.name)) || null;

  const sortedBalances = [...filteredBalances].sort((a, b) => {
    const balanceA = parseFloat(a.smartWalletBalance);
    const balanceB = parseFloat(b.smartWalletBalance);
    return balanceB - balanceA;
  });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-3">
        {sortedBalances.map((token, index) => {
          const balance = token.smartWalletBalance;
          const hasBalance = parseFloat(balance) > 0;
          const isSelected = state.isSelected(token.name);

          if (hasBalance) {
            return (
              <Card
                key={index}
                className={`
                  overflow-hidden transition-all duration-200 ease-in-out shadow-md border border-secondary/20
                  ${
                    isSelected && !hideEmptyBalances
                      ? "ring-2 ring-primary"
                      : "hover:shadow-lg"
                  }
                `}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => handleSelectToken(token)}
                >
                  <CardContent className="p-1">
                    {/* Wallet badge and transfer button */}
                    <div className="flex justify-between items-center">
                      {/* <Badge
                        variant="outline"
                        className="py-1 px-2 flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary border-primary/20"
                      >
                        <WalletIcon className="h-3 w-3" />
                        {balanceType === "eoa"
                          ? "EOA Wallet"
                          : "Kioscoin wallet"}
                      </Badge> */}

                      {!hideEmptyBalances && (
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
                      )}
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
                        textSizeClass="text-md"
                        decimals={token.decimals}
                        amountTextClassName="text-dark"
                      />
                    </div>

                    {/* Transfer component */}
                    {isSelected && !hideEmptyBalances && (
                      <div
                        className="mt-4 pt-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InternalTransferAmountInput
                          selectedToken={selectedToken}
                          handleTransfer={handleTransfer}
                          isEOA={false}
                        />
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            );
          }

          return (
            <Card
              key={index}
              className="overflow-hidden transition-all duration-200 ease-in-out bg-white/60 border border-secondary/20"
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
