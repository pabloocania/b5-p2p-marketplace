import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import KioscoinOnboarding from "./SmartWalletOnboarding";

interface KioscoinConnectButtonProps {
  onConnectingChange: (isConnecting: boolean) => void;
  isConnecting: boolean;
}

const KioscoinConnectButton = ({
  onConnectingChange,
  isConnecting,
}: KioscoinConnectButtonProps) => {
  const { t } = useTranslation();
  const [showTutorial, setShowTutorial] = useState(false);

  const handleConnectClick = () => {
    setShowTutorial(true); // Mostrar tutorial primero
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        const handleOnboardingComplete = () => {
          setShowTutorial(false);
          onConnectingChange(true);
          openConnectModal(); // Conectar wallet después del tutorial
        };

        return (
          <>
            {showTutorial && (
              <KioscoinOnboarding onComplete={handleOnboardingComplete} />
            )}

            {!connected && !isConnecting && (
              <button
                onClick={handleConnectClick}
                type="button"
                className="w-full bg-white border border-secondary hover:bg-secondary hover:text-white text-secondary font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
              >
                {t("connect_wallet")}
              </button>
            )}

            {chain?.unsupported && (
              <button
                onClick={openChainModal}
                type="button"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
              >
                {t("wrong_network")}
              </button>
            )}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default KioscoinConnectButton;
