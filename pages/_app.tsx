import Head from "next/head";
import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { AppProps } from "next/app";
import { UserProvider } from "../src/components/kioscoin/users/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createWagmiConfig } from "@/components/web3/wagmi";
import { EtherspotSdkProvider } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import { TransactionProvider } from "@/components/web3/Transactions/TransactionContext";
import { arbitrumSepolia } from "wagmi/chains";
import "../src/i18n"; // Adjust the path as necessary
import { useEffect, useState } from "react";
import type { Config } from "wagmi";
import { ConfigStore } from "@/lib/ConfigStore";
import { Web3AuthProvider } from "@web3auth/modal/react";
import { useTranslation } from "react-i18next";
import web3AuthContextConfig from "../src/components/web3/web3auth";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [wagmiConfig, setWagmiConfig] = useState<Config>(
    createWagmiConfig([arbitrumSepolia])
  );
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const configStore = ConfigStore.getInstance();
        await configStore.getConfig();
        const enabledChains = await configStore.getEnabledChains();
        setWagmiConfig(createWagmiConfig(enabledChains));
      } catch (error) {
        console.error("Failed to load configs:", error);
        // fallback to default config already set
      } finally {
        setIsConfigLoaded(true);
      }
    };
    // console.log(i18n.language, t("login_to_view"));
    loadConfigs();
  }, []);

  useEffect(() => {
    console.log(i18n.language, t("login_to_view"));
  }, [i18n.language, t]);

  if (!isConfigLoaded) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
        <meta name="description" content="Description" />
        <meta name="keywords" content="Keywords" />
        <title>Kioscoin</title>

        <link rel="manifest" href="/manifest.json" />
        <link
          href="/icons/favicon-16x16.png"
          rel="icon"
          type="image/png"
          sizes="16x16"
        />
        <link
          href="/icons/favicon-32x32.png"
          rel="icon"
          type="image/png"
          sizes="32x32"
        />
        <link rel="apple-touch-icon" href="/apple-icon.png"></link>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com"></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Work+Sans:ital,wght@0,100..900;1,100..900&family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        ></link>
        {/* Preload Donatto font */}
        <link
          rel="preload"
          href="/donatto-logo-font/donatto-regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <meta name="theme-color" content="rgba(225, 234, 240)" />
        {/* <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/> */}
      </Head>
      <Web3AuthProvider config={web3AuthContextConfig}>
        <UserProvider>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider
                modalSize="compact"
                coolMode
                initialChain={arbitrumSepolia}
              >
                <EtherspotSdkProvider>
                  <TransactionProvider>
                    <Component {...pageProps} />
                  </TransactionProvider>
                </EtherspotSdkProvider>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </UserProvider>
      </Web3AuthProvider>
    </>
  );
}
