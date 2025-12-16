import React from "react";
import { LogOut, AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import UserWalletsComponent from "../UserWalletsComponent";
import { ProfileHeader } from "../profile/ProfileHeader";
import UserBalance, {
  DEFAULT_BLOCKCHAIN,
  hasPositiveBalance,
  isMainnet,
  findTokenWithPositiveBalance,
} from "../profile/UserBalance";
import SmartWalletOnboarding from "../profile/SmartWalletOnboarding";
import { KioscoinUser } from "b5-api-client";
import { useState, useEffect, useRef } from "react";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import KioscoinWalletWizard from "@/components/kioscoin/wallet/KioscoinWalletWizard";
import { useWeb3Auth } from "@web3auth/modal/react";
import UserSettings from "../profile/UserSettings";
import { useKioscoinUserContext } from "../KioscoinUserContext";
import { ConfigStore } from "@/lib/ConfigStore";
import { LoadingWallet } from "../../LoadingWallet";

// Preferred mainnet blockchain for initial selection
const PREFERRED_MAINNET = "BSC_MAINNET";
// Usando isotipo PNG en lugar del componente SVG

interface UserProfileProps {
  readonly user: KioscoinUser;
  readonly onLogout: () => void;
  readonly isConnected: boolean;
  readonly isConnecting: boolean;
  readonly onConnectingChange: (isConnecting: boolean) => void;
}

export const UserProfile = ({
  user,
  onLogout,
  isConnected,
  isConnecting,
  onConnectingChange,
}: UserProfileProps) => {
  const { t } = useTranslation();
  const { emailVerified } = useKioscoinUserContext();
  const {
    balances,
    isLoading,
    isReady,
    switchToChain,
    currentChainId,
    swAddress,
  } = useEtherspotSdk();
  const { isConnected: web3AuthConnected, status: web3authStatus } =
    useWeb3Auth();

  // Estado para UserBalance
  const [selectedToken, setSelectedToken] = useState("USDK");
  const [selectedBlockchain, setSelectedBlockchain] =
    useState(PREFERRED_MAINNET);

  // Track if we've done the initial blockchain selection based on balance
  const hasInitializedBlockchain = useRef(false);
  // Track if we've done the initial token selection based on balance
  const hasInitializedToken = useRef(false);

  // Estado para SmartWalletOnboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [previousConnectionState, setPreviousConnectionState] = useState(false);
  // Estado para KioscoinWalletWizard
  const [showWalletWizard, setShowWalletWizard] = useState(false);

  // Handlers para UserBalance
  const handleTokenChange = (token: string) => {
    setSelectedToken(token);
    console.log("Token changed to:", token);
  };

  const handleBlockchainChange = async (blockchain: string) => {
    setSelectedBlockchain(blockchain);
    console.log("Blockchain changed to:", blockchain);

    // Get the chainId for the selected blockchain
    const configStore = ConfigStore.getInstance();
    const chainId = configStore.getChainIdFromBlockchain(blockchain);

    if (chainId && chainId !== 0) {
      console.log("Switching to chainId:", chainId);
      await switchToChain(chainId);
    } else {
      console.warn(`No chainId found for blockchain: ${blockchain}`);
    }
  };

  // Handlers para SmartWalletOnboarding
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("hasSeenSmartWalletOnboarding", "true");
  };

  const handleShowWalletWizard = () => {
    setShowWalletWizard(true);
  };

  // useEffect para manejar el onboarding
  useEffect(() => {
    // Monitor connection status changes to show onboarding when user connects
    if (web3AuthConnected && !previousConnectionState) {
      // Check local storage for onboarding status
      const hasSeenOnboarding = localStorage.getItem(
        "hasSeenSmartWalletOnboarding"
      );

      // Show onboarding on new connection if user hasn't seen it before
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }

    // Update previous connection state
    setPreviousConnectionState(web3AuthConnected);

    // If disconnected, reset component state
    if (!web3AuthConnected) {
      setPreviousConnectionState(false);
    }
  }, [web3AuthConnected, previousConnectionState]);

  // Sync selectedBlockchain with the current chainId from SDK
  useEffect(() => {
    if (currentChainId && currentChainId !== 0) {
      const configStore = ConfigStore.getInstance();
      const blockchainName = configStore.getBlockchainName(currentChainId);
      if (blockchainName && blockchainName !== selectedBlockchain) {
        console.log(
          "Syncing blockchain selector with current chain:",
          blockchainName
        );
        setSelectedBlockchain(blockchainName);
      }
    }
  }, [currentChainId]);

  // Auto-select blockchain based on balance precedence:
  // 1. If current mainnet has balance > 0, stay there
  // 2. If current mainnet has no balance, fallback to ARBITRUM_TESTNET
  // This runs once when balances are first loaded
  useEffect(() => {
    if (
      !hasInitializedBlockchain.current &&
      isReady &&
      balances &&
      balances.length > 0
    ) {
      hasInitializedBlockchain.current = true;

      const currentIsMainnet = isMainnet(selectedBlockchain);
      const currentHasBalance = hasPositiveBalance(balances);

      console.log(
        `Blockchain selection check: ${selectedBlockchain} (mainnet: ${currentIsMainnet}, hasBalance: ${currentHasBalance})`
      );

      // If we're on a mainnet without balance, fallback to ARBITRUM_TESTNET
      if (currentIsMainnet && !currentHasBalance) {
        console.log(
          "No balance on mainnet, falling back to:",
          DEFAULT_BLOCKCHAIN
        );
        handleBlockchainChange(DEFAULT_BLOCKCHAIN);
      }
    }
  }, [isReady, balances, selectedBlockchain]);

  // Reset initialization flags when wallet disconnects
  useEffect(() => {
    if (!web3AuthConnected) {
      hasInitializedBlockchain.current = false;
      hasInitializedToken.current = false;
    }
  }, [web3AuthConnected]);

  // Auto-select token with positive balance when balances change
  // This ensures we show the token with funds, not an empty one
  useEffect(() => {
    if (isReady && balances && balances.length > 0) {
      // Check if current selected token has balance
      const currentTokenBalance = balances.find(
        (b) => b.name === selectedToken
      );
      const currentHasBalance =
        currentTokenBalance &&
        parseFloat(currentTokenBalance.smartWalletBalance || "0") > 0;

      // If current token has no balance, find one that does
      if (!currentHasBalance) {
        const tokenWithBalance = findTokenWithPositiveBalance(balances);
        if (tokenWithBalance && tokenWithBalance !== selectedToken) {
          console.log(
            `Auto-selecting token with balance: ${tokenWithBalance} (current: ${selectedToken})`
          );
          setSelectedToken(tokenWithBalance);
        }
      }
    }
  }, [isReady, balances, selectedToken]);

  // Reset token initialization when blockchain changes
  useEffect(() => {
    hasInitializedToken.current = false;
  }, [selectedBlockchain]);

  // Add a separate effect to ensure onboarding shows on first load if wallet is already connected
  useEffect(() => {
    // If wallet is connected on first render, check if we should show onboarding
    if (web3AuthConnected) {
      // Force check localStorage directly
      const hasSeenOnboarding = window.localStorage.getItem(
        "hasSeenSmartWalletOnboarding"
      );

      // Show onboarding if user hasn't seen it before
      if (!hasSeenOnboarding) {
        console.log("Opening onboarding on initial connection");
        setShowOnboarding(true);
      }
    }
  }, []); // Empty dependency array = run once on mount

  // Define the reset onboarding handler here
  const handleResetOnboardingState = () => {
    localStorage.removeItem("hasSeenSmartWalletOnboarding");
    alert(
      t(
        "onboarding_reset_description",
        "Onboarding will show next time you connect your wallet"
      )
    );
  };

  // Derived UI flags
  const walletInitializing =
    web3authStatus === "connecting" ||
    (web3AuthConnected && (isLoading || !isReady));
  const canShowWallet = isReady && !walletInitializing;

  return (
    <Card className="w-full border border-secondary/20 mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-center items-center align-center mt-1 sm:mt-2 w-full">
          <ProfileHeader user={user} />
        </CardTitle>
      </CardHeader>

      {/* Email Verification Alert */}
      {!emailVerified && (
        <div className="px-3 py-2">
          <Alert className="bg-secondary/5">
            <AlertCircle className="h-4 w-4 text-dark" />
            <AlertDescription className="font-secondary text-xs text-primary">
              <span className="font-semibold">{t("email_not_verified")}:</span>{" "}
              {t("verify_email_message")}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Botón Learn debajo del header y antes del bloque de saldos */}
      <div className="px-3 py-2">
        <div className="w-full flex">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShowWalletWizard}
            className="flex items-center w-full border-secondary font-bold text-secondary text-sm sm:text-base hover:text-white hover:bg-secondary shadow-md rounded-lg"
          >
            <span className="text-sm sm:text-base font-secondary">
              {t("read_about_kioscoin")}
            </span>
            <img
              src="/icons/kioscoin-isotipo.png"
              alt="Kioscoin"
              className="h-8 w-8"
            />
          </Button>
        </div>
      </div>

      {/* UserBalance independiente debajo del ProfileHeader */}
      {canShowWallet && balances && (
        <div className="flex space-y-1.5 p-3 pb-2 pt-2">
          <UserBalance
            balances={balances}
            selectedToken={selectedToken}
            selectedBlockchain={selectedBlockchain}
            onTokenChange={handleTokenChange}
            onBlockchainChange={handleBlockchainChange}
          />
        </div>
      )}

      <CardContent className="space-y-4 sm:space-y-4">
        {(isConnecting || walletInitializing) && <LoadingWallet />}

        {canShowWallet && (
          <div className="w-full flex space-y-1.5 pt-2">
            <UserWalletsComponent selectedBlockchain={selectedBlockchain} />
          </div>
        )}

        {/* SmartWalletOnboarding independiente */}
        {showOnboarding && (
          <SmartWalletOnboarding onComplete={handleOnboardingComplete} />
        )}
        {/* Wizard de Kioscoin Wallet */}
        {showWalletWizard && (
          <KioscoinWalletWizard
            open={showWalletWizard}
            onClose={() => setShowWalletWizard(false)}
            address={swAddress}
          />
        )}
        <div className="shadow-md border border-secondary/20 rounded-lg">
          <UserSettings />
        </div>
        {/* 
          // Botón para reiniciar el estado del onboarding
          // Permite al usuario volver a ver el tutorial de Smart Wallet
          // Funcionalidad: Borra el localStorage "hasSeenSmartWalletOnboarding"
          // y muestra un alert confirmando que el onboarding se mostrará en la próxima conexión
        */}
        {/* 
        <div className="w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetOnboardingState}
            className="flex items-center border border-primary/50 text-primary"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            <span className="text-xs">{t("reset_onboarding")}</span>
          </Button>
        </div>
        */}
      </CardContent>
      <CardFooter className="py-2">
        <Button
          onClick={onLogout}
          variant="default"
          className="w-full text-white font-secondary bg-primary text-sm sm:text-base py-2 sm:py-3"
        >
          <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Log Out
        </Button>
      </CardFooter>
    </Card>
  );
};
