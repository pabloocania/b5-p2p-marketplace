"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenBalance } from "@/lib/web3/types";
import { ArrowLeftRightIcon, MoveRightIcon } from "lucide-react";

interface TokenBalanceListProps {
  balances?: TokenBalance[];
  onTokenSelect: (token: TokenBalance | null) => void;
}

export default function TokenBalanceList({
  balances = [],
  onTokenSelect,
}: TokenBalanceListProps) {
  const [balanceType, setBalanceType] = useState<"eoa" | "smartWallet">("eoa");
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);

  const handleTokenClick = (token: TokenBalance) => {
    const newSelectedToken = selectedToken?.name === token.name ? null : token;
    setSelectedToken(newSelectedToken);
    onTokenSelect(newSelectedToken);
  };

  const getIconClassNames = (token: TokenBalance) => {
    return selectedToken?.name === token?.name
      ? "text-blue-700 bg-blue-100 shadow-lg rounded-full flex items-center justify-center h-5 w-5"
      : "text-muted-foreground";
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-bold"></CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {balances.length > 0 ? (
          <div className="space-y-1">
            {balances.map((token, index) => {
              const balance =
                balanceType === "eoa"
                  ? token.eoaBalance
                  : token.smartWalletBalance;
              return (
                <div
                  key={index}
                  className="flex justify-between items-center py-1 border-b last:border-b-0 text-sm"
                >
                  <div>
                    <span className="font-medium">{token.name}</span>
                  </div>
                  <span className="font-medium">
                    {parseFloat(balance).toFixed(6)}
                  </span>
                  {parseFloat(balance) > 0 && (
                    <button
                      onClick={() => handleTokenClick(token)}
                      className="p-1 rounded-full bg-muted transition-colors"
                      aria-label={`Toggle ${token.name} details`}
                    >
                      <MoveRightIcon
                        className={`h-5 w-5 transition-transform ${getIconClassNames(
                          token
                        )}`}
                      />
                    </button>
                  )}
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
