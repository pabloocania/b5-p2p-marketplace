"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { TokenBalance, TokenTransfer } from "@/components/web3/types";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import { useTransaction } from "@/components/web3/Transactions/TransactionContext";
import { useTransactionStatusChecker } from "@/components/web3/Transactions/useTransactionStatusChecker";
import { useTransactionHandler } from "@/components/web3/Transfers/useTransactionsHandler";
import Address from "@/components/web3/Transfers/Address";

/**
 * Immutable class representing the state of the transfers component
 */
class TransferState {
  readonly selectedToken: TokenBalance | null;
  readonly showOnboarding: boolean;
  readonly transferHistory: TokenTransfer[];
  readonly previousConnectionState: boolean;

  private constructor(params: {
    selectedToken: TokenBalance | null;
    showOnboarding: boolean;
    transferHistory: TokenTransfer[];
    previousConnectionState: boolean;
  }) {
    this.selectedToken = params.selectedToken;
    this.showOnboarding = params.showOnboarding;
    this.transferHistory = params.transferHistory;
    this.previousConnectionState = params.previousConnectionState;
  }

  static create(
    params?: Partial<{
      selectedToken: TokenBalance | null;
      showOnboarding: boolean;
      transferHistory: TokenTransfer[];
      previousConnectionState: boolean;
    }>
  ): TransferState {
    return new TransferState({
      selectedToken: params?.selectedToken ?? null,
      showOnboarding: params?.showOnboarding ?? false,
      transferHistory: params?.transferHistory ?? [],
      previousConnectionState: params?.previousConnectionState ?? false,
    });
  }

  withSelectedToken(selectedToken: TokenBalance | null): TransferState {
    return new TransferState({
      ...this,
      selectedToken,
    });
  }

  withShowOnboarding(showOnboarding: boolean): TransferState {
    return new TransferState({
      ...this,
      showOnboarding,
    });
  }

  withPreviousConnectionState(previousConnectionState: boolean): TransferState {
    return new TransferState({
      ...this,
      previousConnectionState,
    });
  }

  addToHistory(transfer: TokenTransfer): TransferState {
    return new TransferState({
      ...this,
      transferHistory: [transfer, ...this.transferHistory].slice(0, 10),
    });
  }
}
import { parseUnits } from "viem";
import { useWeb3Auth } from "@web3auth/modal/react";

interface UserWalletsComponentProps {
  selectedBlockchain?: string;
}

export default function UserWalletsComponent({
  selectedBlockchain = "BSC_MAINNET",
}: UserWalletsComponentProps) {
  const { t } = useTranslation();
  const { setTransaction } = useTransaction();
  const { balances, swAddress, primeSdk, eoaAddress, refreshBalances } =
    useEtherspotSdk();
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>(
    balances ?? []
  );
  // const { isConnected, address } = useAccount();
  const { isConnected } = useWeb3Auth();
  const [state, setState] = useState<TransferState>(
    TransferState.create({
      previousConnectionState: false,
    })
  );

  // State for UserBalance component
  const [selectedToken, setSelectedToken] = useState("USDK");

  const { checkTransactionStatus } = useTransactionStatusChecker();
  const { handleTransaction } = useTransactionHandler(
    setTransaction,
    t,
    checkTransactionStatus
  );

  // Monitor connection status changes to show onboarding when user connects
  useEffect(() => {
    // Only trigger when connection state changes from disconnected to connected
    if (isConnected && !state.previousConnectionState) {
      // Check local storage for onboarding status
      const hasSeenOnboarding = localStorage.getItem(
        "hasSeenSmartWalletOnboarding"
      );

      // Show onboarding on new connection if user hasn't seen it before
      if (!hasSeenOnboarding) {
        setState((prev) => prev.withShowOnboarding(true));
      }
    }

    // Update previous connection state
    setState((prev) => prev.withPreviousConnectionState(isConnected));

    // If disconnected, reset component state
    if (!isConnected) {
      setState((prev) =>
        TransferState.create({
          previousConnectionState: false,
        })
      );
    }
  }, [isConnected]);

  // Add a separate effect to ensure onboarding shows on first load if wallet is already connected
  useEffect(() => {
    // If wallet is connected on first render, check if we should show onboarding
    if (isConnected) {
      // Force check localStorage directly
      const hasSeenOnboarding = window.localStorage.getItem(
        "hasSeenSmartWalletOnboarding"
      );

      // Show onboarding if user hasn't seen it before
      if (!hasSeenOnboarding) {
        console.log("Opening onboarding on initial connection");
        setState((prev) => prev.withShowOnboarding(true));
      }
    }
  }, []); // Empty dependency array = run once on mount

  const handleTransfer = async (transferAmount: string) => {
    if (state.selectedToken) {
      const amount = parseFloat(transferAmount);
      if (isNaN(amount) || amount <= 0) return;
      const formattedAmount = parseUnits(
        transferAmount,
        state.selectedToken.decimals
      ).toString();
      const sourceBalance = parseFloat(state.selectedToken.smartWalletBalance);

      if (amount > sourceBalance) return;

      const transactionType = "EtherspotToEOA";

      // Create a TokenTransfer object
      const newTransfer = TokenTransfer.create({
        tokenSymbol: state.selectedToken.name,
        tokenAddress: state.selectedToken.address,
        amount: transferAmount,
        sourceType: "smartWallet",
        destinationType: "eoa",
      });

      // Execute transfer immediately
      try {
        await handleTransaction(
          transactionType,
          state.selectedToken.address,
          formattedAmount
        );

        // Add to history with completed status
        setState(state.addToHistory(newTransfer.withStatus("completed")));
      } catch (error) {
        console.error("Transfer failed:", error);
        // Add to history with failed status
        setState(state.addToHistory(newTransfer.withStatus("failed")));
      }
    }
  };

  const handleRefresh = async () => {
    await refreshBalances();
  };

  useEffect(() => {
    setTokenBalances(balances ?? []);
  }, [balances]);

  const handleTokenSelect = (token: TokenBalance | null) => {
    setState(state.withSelectedToken(token));
  };

  // Handlers de onboarding movidos a UserProfile

  // Handlers for UserBalance component
  const handleTokenChange = (token: string) => {
    setSelectedToken(token);
    console.log("Token changed to:", token);
  };

  if (!tokenBalances) {
    return <div>{t("no_stablecoins_available")}</div>;
  }

  return (
    <>
      <div className="flex flex-col items-center w-full rounded-lg bg-white space-y-2 shadow-md border border-secondary/20 p-3">
        <div className="w-full">
          {swAddress && (
            <div>
              {/* <p className="font-bold text-primary text-sm">{t("address")}</p> */}
              <Address
                address={swAddress}
                balances={tokenBalances}
                currentBlockchain={selectedBlockchain}
                onRefreshBalances={refreshBalances}
              />
            </div>
          )}
          {/* <div className="flex items-center">
            <p className="font-bold text-primary text-sm">Balances</p>
            <Button
              variant="outline"
              className="p-1 border-secondary/50 bg-white ml-2"
              size="link"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div> */}

          {/* UserBalance movido a UserProfile - debajo del ProfileHeader */}
        </div>
      </div>
    </>
  );
}
