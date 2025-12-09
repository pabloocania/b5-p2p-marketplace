"use client";

import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import TokenBalanceCardList from "../../TokenBalancesCardsList";
import { TokenBalance } from "@/components/web3/types";

interface OperationBalanceSectionProps {
  readonly balances?: TokenBalance[];
  readonly labelKey?: string; // i18n key for label
  readonly visible?: boolean;
  readonly onTokenSelect?: (token: TokenBalance | null) => void;
  readonly handleTransfer?: (transferAmount: string) => void;
  readonly hideEmptyBalances?: boolean;
}

export default function OperationBalanceSection({
  balances = [],
  visible = true,
  onTokenSelect = () => {},
  handleTransfer = () => {},
  hideEmptyBalances = true,
}: OperationBalanceSectionProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div className="space-y-1">
      <div className="text-xs text-dark font-secondary">
        {t("your_balance")}
      </div>
      <TokenBalanceCardList
        balances={balances}
        onTokenSelect={onTokenSelect}
        handleTransfer={handleTransfer}
        hideEmptyBalances={hideEmptyBalances}
      />
    </div>
  );
}
