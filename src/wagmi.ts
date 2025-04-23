import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrumSepolia, rootstock, rootstockTestnet, arbitrum, base } from "wagmi/chains";
import {
    metaMaskWallet
} from '@rainbow-me/rainbowkit/wallets';

export const config = getDefaultConfig({
    wallets: [
        {
            groupName: 'Recommended',
            wallets: [metaMaskWallet],
        },
    ],
    appName: "Kioscoin",
    projectId: "95db6ef5cbe6a2117818a0df1791fd86",
    chains: [
        rootstock,
        rootstockTestnet,
        arbitrumSepolia,
        arbitrum,
        base,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
            ? [rootstockTestnet, arbitrumSepolia]
            : []),
    ],
    ssr: true,
});