import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTranslation } from "react-i18next";

interface KioscoinConnectButtonProps {
  onConnectingChange: (isConnecting: boolean) => void;
  isConnecting: boolean;
}

const KioscoinConnectButton = ({
  onConnectingChange,
  isConnecting,
}: KioscoinConnectButtonProps) => {
  const { t } = useTranslation();
  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        const handleConnectClick = () => {
          onConnectingChange(true); // Notify UserMenu about the connection attempt
          openConnectModal();
        };

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected && !isConnecting) {
                return (
                  <button
                    onClick={handleConnectClick}
                    type="button"
                    className="w-full bg-terciary hover:bg-terciary text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                  >
                    {t("connect_wallet")}
                  </button>
                );
              }

              if (chain?.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                  >
                    {t("wrong_network")}
                  </button>
                );
              }

              if (!isConnecting && connected) {
                return (
                  <div className="w-full flex items-center justify-between w-full">
                    <p className="font-bold text-primary text-left">
                      {t("connected_to")}
                    </p>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={openChainModal}
                        className="flex items-center bg-terciary text-white hover:bg-gray-300 py-2 px-4 rounded transition duration-150 ease-in-out"
                      >
                        {chain?.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 12,
                              height: 12,
                              borderRadius: 999,
                              overflow: "hidden",
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                style={{ width: 12, height: 12 }}
                              />
                            )}
                          </div>
                        )}
                        {chain?.name}
                      </button>
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default KioscoinConnectButton;
