import Head from "next/head";
import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { AppProps } from "next/app";
import { UserProvider } from "../src/components/ui/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { config } from "../src/wagmi";
import { EtherspotSdkProvider } from "@/lib/web3/EtherspotSdkProvider";
import { TransactionProvider } from "@/lib/web3/TransactionContext";
import { arbitrumSepolia, rootstockTestnet } from "wagmi/chains";
import "../src/i18n"; // Adjust the path as necessary

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
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
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        ></link>
        <meta name="theme-color" content="rgba(225, 234, 240)" />
        {/* <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/> */}
      </Head>
      <UserProvider>
        <WagmiProvider config={config}>
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
    </>
  );
}
