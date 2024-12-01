import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTranslation } from "react-i18next";

const KioscoinConnectButton = () => {
  const { t } = useTranslation();
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

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
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="w-full bg-terciary hover:bg-terciary text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                  >
                    {t("connect_wallet")}
                  </button>
                );
              }

              if (chain.unsupported) {
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

              return (
                <div className="w-full flex flex-col">
                  <p className="font-bold text-primary text-left">
                    {t("connected_to")}
                  </p>
                  <div className="w-full flex items-center justify-between mb-4">
                    <button
                      onClick={openChainModal}
                      className="flex items-center bg-primary text-white hover:bg-gray-300 py-2 px-4 rounded-l transition duration-150 ease-in-out w-1/2"
                    >
                      {chain.hasIcon && (
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
                      {chain.name}
                    </button>
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="bg-secondary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r transition duration-150 ease-in-out w-1/2"
                    >
                      {account.displayName}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default KioscoinConnectButton;
