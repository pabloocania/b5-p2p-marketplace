"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenBalance } from "@/lib/web3/types";
import { ArrowLeftRightIcon, MoveRightIcon } from "lucide-react";

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
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);

  const handleTokenClick = (token: TokenBalance) => {
    const newSelectedToken = selectedToken?.name === token.name ? null : token;
    setSelectedToken(newSelectedToken);
    onTokenSelect(newSelectedToken);
  };

  const getIconClassNames = (token: TokenBalance) => {
    return selectedToken?.name === token?.name
      ? "text-secondary-700 bg-secondary-100 shadow-lg rounded-full flex items-center justify-center"
      : "text-muted-foreground";
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-transparent">
      <CardContent className="px-0">
        {balances.length > 0 ? (
          <div className="space-y-2">
            {balances.map((token, index) => {
              const balance =
                balanceType === "eoa"
                  ? token.eoaBalance
                  : token.smartWalletBalance;
              return (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm text-primary"
                >
                  <div className="flex-none w-24">
                    <span className="text-sm font-bold text-terciary">
                      {token.name}
                    </span>
                  </div>
                  <span className="flex-grow text-sm text-right pr-2">
                    {parseFloat(balance).toFixed(6)}
                  </span>
                  <button
                    onClick={() => handleTokenClick(token)}
                    className="flex-none rounded-full bg-secondary"
                    aria-label={`Toggle ${token.name} details`}
                    disabled={parseFloat(balance) <= 0}
                  >
                    <ArrowLeftRightIcon
                      className={`h-5 w-5 p-1 text-white ${getIconClassNames(
                        token
                      )}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm">
            No token balances to display.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
