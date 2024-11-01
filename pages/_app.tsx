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
import { rootstockTestnet } from "wagmi/chains";

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
        <title>Beefive - P2P stablecoin market</title>

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
        <meta name="theme-color" content="#317EFB" />
      </Head>
      <UserProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              modalSize="compact"
              coolMode
              initialChain={rootstockTestnet}
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
