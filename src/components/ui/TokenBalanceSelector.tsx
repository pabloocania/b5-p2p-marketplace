"use client";

import { TokenBalance } from "@/lib/web3/types";
import TokenBalanceCardList from "./TokenBalancesAlt";

interface TokenBalanceSelectorProps {
  balances?: TokenBalance[];
  balanceType: "eoa" | "sw";
  onTokenSelect: (token: TokenBalance | null) => void;
}

/**
 * Simplified selector that only uses the Card View
 */
export default function TokenBalanceSelector({
  balances = [],
  balanceType,
  onTokenSelect,
}: TokenBalanceSelectorProps) {
  return (
    <TokenBalanceCardList
      balances={balances}
      balanceType={balanceType}
      onTokenSelect={onTokenSelect}
    />
  );
}
