import Head from "next/head";
import "../styles/globals.css";
import { AppProps } from "next/app";
import { KioscoinUserProvider } from "../src/components/kioscoin/users/KioscoinUserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { createWagmiConfig } from "@/components/web3/wagmi";
import { EtherspotSdkProvider } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import { TransactionProvider } from "@/components/web3/Transactions/TransactionContext";
import { bsc } from "wagmi/chains";
import "../src/i18n"; // Adjust the path as necessary
import { useEffect, useState } from "react";
import type { Config } from "wagmi";
import { ConfigStore } from "@/lib/ConfigStore";
import { Web3AuthProvider } from "@web3auth/modal/react";
import { useTranslation } from "react-i18next";
import web3AuthContextConfig from "../src/components/web3/web3auth";
import { Toaster } from "@/components/ui/toaster";
import { AppLoadingScreen } from "@/components/kioscoin/loading/AppLoadingScreen";
import { NavigationProvider } from "@/components/kioscoin/NavigationContext";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [wagmiConfig, setWagmiConfig] = useState<Config>(
    createWagmiConfig([bsc])
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
    return <AppLoadingScreen />;
  }

  return (
    <>
      <Head>
        {/* Viewport debe estar en _app.tsx para que sea dinámico */}
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"
        />
        <title>Kioscoin - P2P Stablecoin Market</title>
        
        {/* Meta tags duplicados aquí también para asegurar que estén disponibles durante loading */}
        {/* Estos se combinan con los de _document.tsx pero no causan conflicto */}
        <meta property="og:title" content="Kioscoin - P2P Stablecoin Market" />
        <meta property="og:description" content="The future of P2P crypto trading. Buy and sell stablecoins with real people, using secure and decentralized escrow." />
        <meta property="og:image" content="https://www.kioscoin.com/og-image.png" />
        <meta property="og:url" content="https://www.kioscoin.com" />
        
        {/* Preconnect para fuentes y recursos externos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Work+Sans:ital,wght@0,100..900;1,100..900&family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        {/* Preload Donatto font */}
        <link
          rel="preload"
          href="/donatto-logo-font/donatto-regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </Head>
      <Web3AuthProvider config={web3AuthContextConfig}>
        <KioscoinUserProvider>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <EtherspotSdkProvider>
                <TransactionProvider>
                  <NavigationProvider initialView="OrderFeed">
                    <Component {...pageProps} />
                    <Toaster />
                  </NavigationProvider>
                </TransactionProvider>
              </EtherspotSdkProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </KioscoinUserProvider>
      </Web3AuthProvider>
    </>
  );
}
