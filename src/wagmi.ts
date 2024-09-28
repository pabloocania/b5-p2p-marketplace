import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { rootstock, rootstockTestnet } from "wagmi/chains";
import {
    metaMaskWallet
} from '@rainbow-me/rainbowkit/wallets';


// 2. Set up a Wagmi Config
// export const config = createConfig({
//     // projectId: "95db6ef5cbe6a2117818a0df1791fd86",
//     chains: [rootstock, rootstockTestnet],
//     transports: {
//       [rootstock.id]: http(),
//       [rootstockTestnet.id]: http(),
//     },
//   });

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
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
            ? [rootstockTestnet]
            : []),
    ],
    ssr: true,
});