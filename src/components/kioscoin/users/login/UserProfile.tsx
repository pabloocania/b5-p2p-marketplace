import React from "react";
import { LogOut, Loader2, RotateCcw } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import KioscoinConnectButton from "../KioscoinConnectButton";
import UserWalletsComponent from "../UserWalletsComponent";
import { ProfileHeader } from "../ProfileHeader";
import UserBalance from "../UserBalance";
import SmartWalletOnboarding from "../SmartWalletOnboarding";
import { KioscoinUser } from "b5-api-client";
import { useState, useEffect } from "react";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import { useWeb3Auth } from "@web3auth/modal/react";
import { Info } from "lucide-react";
import UserSettings from "../UserSettings";
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
  const { balances } = useEtherspotSdk();
  const { isConnected: web3AuthConnected } = useWeb3Auth();

  // Estado para UserBalance
  const [selectedToken, setSelectedToken] = useState("USDK");
  const [selectedBlockchain, setSelectedBlockchain] =
    useState("ARBITRUM_TESTNET");

  // Estado para SmartWalletOnboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [previousConnectionState, setPreviousConnectionState] = useState(false);

  // Handlers para UserBalance
  const handleTokenChange = (token: string) => {
    setSelectedToken(token);
    console.log("Token changed to:", token);
  };

  const handleBlockchainChange = (blockchain: string) => {
    setSelectedBlockchain(blockchain);
    console.log("Blockchain changed to:", blockchain);
  };

  // Handlers para SmartWalletOnboarding
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("hasSeenSmartWalletOnboarding", "true");
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
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

  function ConnectWalletButton() {
    return (
      <div className="w-full">
        <style jsx>{`
          div :global(.iek7po2) {
            width: 100%;
          }
        `}</style>
        <KioscoinConnectButton
          onConnectingChange={onConnectingChange}
          isConnecting={isConnecting}
        />
      </div>
    );
  }

  return (
    <Card className="w-full mb-2 sm:mb-4" variant="shadow">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="flex justify-center items-center align-center mt-1 sm:mt-2 w-full">
          <ProfileHeader user={user} />
        </CardTitle>
      </CardHeader>

      {/* UserBalance independiente debajo del ProfileHeader */}
      {isConnected && balances && (
        <div className="px-4 pb-2">
          <UserBalance
            balances={balances}
            selectedToken={selectedToken}
            selectedBlockchain={selectedBlockchain}
            onTokenChange={handleTokenChange}
            onBlockchainChange={handleBlockchainChange}
          />
        </div>
      )}

      <Separator className="mt-1 sm:mt-2 mb-2 sm:mb-4" />
      <CardContent className="space-y-2 sm:space-y-4">
        <div className="w-full">{ConnectWalletButton()}</div>
        {isConnecting && (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
              <span className="text-sm block">{t("loading_wallet")}</span>
            </div>
          </div>
        )}

        {isConnected && (
          <div className="w-full">
            <UserWalletsComponent />
          </div>
        )}

        {/* Botón "Read about Kioscoin" independiente - DEBAJO de UserWalletsComponent */}
        {isConnected && (
          <div className="w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowOnboarding}
              className="flex items-center w-full border-yellow-300 font-bold text-yellow-400 text-sm sm:text-base py-2 px-2 hover:bg-yellow-50"
            >
              <span className="text-sm sm:text-base font-secondary">
                {t("read_about_kioscoin")}
              </span>
              <img
                src="/icons/kioscoin-isotipo.png"
                alt="Kioscoin"
                className="h-8 w-8 ml-2"
              />
            </Button>
          </div>
        )}

        {/* SmartWalletOnboarding independiente */}
        {showOnboarding && (
          <SmartWalletOnboarding onComplete={handleOnboardingComplete} />
        )}
        <div className="w-full">
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
      <CardFooter className="py-1 sm:py-2">
        <Button
          onClick={onLogout}
          variant="default"
          className="w-full text-white bg-primary text-sm sm:text-base py-2 sm:py-3"
        >
          <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Log Out
        </Button>
      </CardFooter>
    </Card>
  );
};
