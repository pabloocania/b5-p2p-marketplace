"use client";

import { RefreshCw, ChevronRight, Info, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TokenBalance, TokenTransfer } from "./types";
import { useEtherspotSdk } from "./AccountAbstraction/EtherspotSdkProvider";
import { useAccount } from "wagmi";
import TokenBalanceSelector from "@/components/ui/TokenBalanceSelector";
import { useTransaction } from "./TransactionContext";
import { useTransactionStatusChecker } from "../useTransactionStatusChecker";
import { useTransactionHandler } from "./InternalTransferServices";
import Address from "./Address";
import SmartWalletOnboarding from "./SmartWalletOnboarding";
import { Button } from "@/components/ui/button";

/**
 * Immutable class representing the state of the transfers component
 */
class TransferState {
  readonly activeTab: "kioscoinWallet" | "myWallet";
  readonly selectedToken: TokenBalance | null;
  readonly showOnboarding: boolean;
  readonly transferHistory: TokenTransfer[];
  readonly previousConnectionState: boolean;

  private constructor(params: {
    activeTab: "kioscoinWallet" | "myWallet";
    selectedToken: TokenBalance | null;
    showOnboarding: boolean;
    transferHistory: TokenTransfer[];
    previousConnectionState: boolean;
  }) {
    this.activeTab = params.activeTab;
    this.selectedToken = params.selectedToken;
    this.showOnboarding = params.showOnboarding;
    this.transferHistory = params.transferHistory;
    this.previousConnectionState = params.previousConnectionState;
  }

  static create(
    params?: Partial<{
      activeTab: "kioscoinWallet" | "myWallet";
      selectedToken: TokenBalance | null;
      showOnboarding: boolean;
      transferHistory: TokenTransfer[];
      previousConnectionState: boolean;
    }>
  ): TransferState {
    return new TransferState({
      activeTab: params?.activeTab ?? "kioscoinWallet",
      selectedToken: params?.selectedToken ?? null,
      showOnboarding: params?.showOnboarding ?? false,
      transferHistory: params?.transferHistory ?? [],
      previousConnectionState: params?.previousConnectionState ?? false,
    });
  }

  withActiveTab(activeTab: "kioscoinWallet" | "myWallet"): TransferState {
    return new TransferState({
      ...this,
      activeTab,
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
import { ConfigStore } from "../ConfigStore";
import { parseUnits } from "viem";

export default function InternalTransfersComponent() {
  const { t } = useTranslation();
  const { setTransaction } = useTransaction();
  const { balances, swAddress, getTokensBalances, primeSdk } =
    useEtherspotSdk();
  const { isConnected, address } = useAccount();
  const [state, setState] = useState<TransferState>(
    TransferState.create({
      previousConnectionState: false,
    })
  );

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

      // Get stablecoins from ConfigStore
      const stablecoins =
        ConfigStore.getInstance().getBackendStablecoins()
          ?.supportedStablecoins || [];
      const tokenInfo = stablecoins.find((stablecoin) =>
        stablecoin.addresses.some(
          (addr) =>
            addr.address.toLowerCase() ===
            state.selectedToken?.address.toLowerCase()
        )
      );
      console.log("tokenInfo", tokenInfo);
      const tokenDecimals =
        tokenInfo?.name === "USDC" || tokenInfo?.name === "USDT" ? 6 : 18;

      // Use parseUnits instead of formatUnits to convert to wei
      const formattedAmount = parseUnits(
        transferAmount,
        tokenDecimals
      ).toString();
      console.log("formattedAmount", formattedAmount);

      const sourceBalance =
        state.activeTab === "myWallet"
          ? parseFloat(state.selectedToken.eoaBalance)
          : parseFloat(state.selectedToken.smartWalletBalance);

      if (amount > sourceBalance) return;

      const transactionType =
        state.activeTab === "myWallet" ? "EOAToSW" : "EtherspotToEOA";

      // Create a TokenTransfer object
      const newTransfer = TokenTransfer.create({
        tokenSymbol: state.selectedToken.name,
        tokenAddress: state.selectedToken.address,
        amount: transferAmount,
        sourceType: state.activeTab === "myWallet" ? "eoa" : "smartWallet",
        destinationType: state.activeTab === "myWallet" ? "smartWallet" : "eoa",
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
    if (primeSdk) {
      await getTokensBalances(primeSdk);
    } else {
      console.error("PrimeSdk is not initialized.");
    }
  };

  const handleTokenSelect = (token: TokenBalance | null) => {
    setState(state.withSelectedToken(token));
  };

  const handleOnboardingComplete = () => {
    setState(state.withShowOnboarding(false));
    localStorage.setItem("hasSeenSmartWalletOnboarding", "true");
  };

  const handleShowOnboarding = () => {
    setState(state.withShowOnboarding(true));
  };

  const handleTabChange = (value: string) => {
    setState(state.withActiveTab(value as "kioscoinWallet" | "myWallet"));
  };

  if (!balances) {
    return <div>{t("no_stablecoins_available")}</div>;
  }

  return (
    <>
      {state.showOnboarding && (
        <SmartWalletOnboarding
          onComplete={handleOnboardingComplete}
          onStartTransfer={() => {
            setState((prev) => prev.withActiveTab("myWallet"));
          }}
        />
      )}

      <div className="flex flex-col items-center w-full rounded-lg px-1 bg-white space-y-3 py-1">
        <div className="w-full flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShowOnboarding}
            className="flex items-center w-full border-secondary/50 font-bold text-secondary"
          >
            <Info className="h-3 w-3 mr-1" />
            <span className="text-xs">{t("learn_about_smart_wallet")}</span>
          </Button>
        </div>

        <Tabs
          value={state.activeTab}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-2 bg-secondary bg-opacity-10">
            <TabsTrigger
              value="kioscoinWallet"
              className={`flex items-center justify-center w-full ${
                state.activeTab === "kioscoinWallet"
                  ? "border border-secondary bg-primary"
                  : "text-primary bg-transparent"
              }`}
            >
              <span className="flex items-center text-primary font-bold">
                Smart Wallet
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="myWallet"
              className={`flex items-center justify-center w-full ${
                state.activeTab === "myWallet"
                  ? "border border-secondary bg-primary"
                  : "text-primary bg-transparent"
              }`}
            >
              <span className="flex items-center text-primary font-bold">
                EOA Wallet
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="kioscoinWallet"
            className="px-2 bg-secondary bg-opacity-10 rounded-lg py-2 space-y-2"
          >
            {swAddress && (
              <div className="space-y-1">
                <p className="font-bold text-primary text-sm">{t("address")}</p>
                <Address address={swAddress} />
              </div>
            )}
            <div className="flex items-center">
              <p className="font-bold text-primary text-sm">Balances</p>
              <Button
                variant="outline"
                className="p-1 border-secondary/50 bg-white ml-2"
                size="link"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <TokenBalanceSelector
              onTokenSelect={handleTokenSelect}
              balanceType="sw"
              balances={balances}
            />
          </TabsContent>

          <TabsContent
            value="myWallet"
            className="px-2 bg-secondary bg-opacity-10 rounded-lg py-2 space-y-2"
          >
            {address && (
              <div className="space-y-1">
                <p className="font-bold text-primary text-sm">{t("address")}</p>
                <Address address={address} />
              </div>
            )}
            <div className="flex items-center">
              <p className="font-bold text-primary text-sm">Balances</p>
              <Button
                variant="outline"
                className="p-1 border-secondary/50 bg-white ml-2"
                size="link"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <TokenBalanceSelector
              onTokenSelect={handleTokenSelect}
              balanceType="eoa"
              balances={balances}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
