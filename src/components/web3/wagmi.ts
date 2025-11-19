import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
    metaMaskWallet
} from '@rainbow-me/rainbowkit/wallets';
import { ConfigStore, initConfig } from "../../lib/ConfigStore";
import { arbitrumSepolia, rootstock } from "wagmi/chains";
import { Chain } from "wagmi/chains";
import { bsc } from '@wagmi/core/chains'
import { http } from '@wagmi/core'

const configStore = ConfigStore.getInstance();

// Initialize with default chain
const defaultChains = [arbitrumSepolia] as const;

// Create initial config with default chain
const initialConfig = getDefaultConfig({
    wallets: [
        {
            groupName: 'Recommended',
            wallets: [metaMaskWallet],
        },
    ],
    appName: "Kioscoin",
    projectId: "95db6ef5cbe6a2117818a0df1791fd86",
    chains: defaultChains,
    ssr: true,
});

// Function to initialize both backend and wagmi configs
export async function initializeConfigs() {
    try {
        // Initialize backend config
        await initConfig();

        // Get enabled chains from backend
        const enabledChains = await configStore.getEnabledChains();

        // Create final config with enabled chains
        const finalConfig = getDefaultConfig({
            wallets: [
                {
                    groupName: 'Recommended',
                    wallets: [metaMaskWallet],
                },
            ],
            appName: "Kioscoin",
            projectId: "95db6ef5cbe6a2117818a0df1791fd86",
            chains: enabledChains.length > 0 ? enabledChains : defaultChains,
            ssr: true,
            transports: {
                [bsc.id]: http('https://rpc.ankr.com/bsc/43e5f2a7dbfddf572c74f1b3b07cc450e42d68d64fa30ea90efb41bdc5cf2e10'),
            },
        });
        // 
        return finalConfig;
    } catch (error) {
        console.error("Failed to initialize configs:", error);
        return initialConfig;
    }
}

// Export initial config for immediate use
export const config = initialConfig;

export function createWagmiConfig(chains: readonly [Chain, ...Chain[]]) {
    return getDefaultConfig({
        wallets: [
            {
                groupName: 'Recommended',
                wallets: [metaMaskWallet],
            },
        ],
        appName: "Kioscoin",
        projectId: "95db6ef5cbe6a2117818a0df1791fd86",
        chains,
        transports: {
            [bsc.id]: http('https://rpc.ankr.com/bsc/43e5f2a7dbfddf572c74f1b3b07cc450e42d68d64fa30ea90efb41bdc5cf2e10'),
        },
        ssr: true,
    });
}
