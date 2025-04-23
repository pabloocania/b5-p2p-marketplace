"use client";

import { TokenBalance } from "@/lib/web3/types";
import TokenBalanceCardList from "./TokenBalancesCardsList";

interface TokenBalanceSelectorProps {
  balances?: TokenBalance[];
  balanceType: "eoa" | "sw";
  onTokenSelect: (token: TokenBalance | null) => void;
  handleTransfer: (transferAmount: string) => void;
}

/**
 * Simplified selector that only uses the Card View
 */
export default function TokenBalanceSelector({
  balances = [],
  balanceType,
  onTokenSelect,
  handleTransfer,
}: TokenBalanceSelectorProps) {
  return (
    <TokenBalanceCardList
      balances={balances}
      balanceType={balanceType}
      onTokenSelect={onTokenSelect}
      handleTransfer={handleTransfer}
    />
  );
}
