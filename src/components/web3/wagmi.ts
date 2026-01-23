import { createConfig } from "wagmi";
import { ConfigStore, initConfig } from "../../lib/ConfigStore";
import { Chain } from "wagmi/chains";
import { bsc } from '@wagmi/core/chains'
import { http } from '@wagmi/core'

const configStore = ConfigStore.getInstance();

// Initialize with default chain (BSC Mainnet)
const defaultChains = [bsc] as const;

// Create initial config with default chain
const initialConfig = createConfig({
    chains: defaultChains,
    transports: {
        [bsc.id]: http('https://rpc.ankr.com/bsc/43e5f2a7dbfddf572c74f1b3b07cc450e42d68d64fa30ea90efb41bdc5cf2e10'),
    },
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
        const finalConfig = createConfig({
            chains: enabledChains.length > 0 ? enabledChains : defaultChains,
            transports: enabledChains.reduce((acc, chain) => {
                if (chain.id === bsc.id) {
                    acc[chain.id] = http('https://rpc.ankr.com/bsc/43e5f2a7dbfddf572c74f1b3b07cc450e42d68d64fa30ea90efb41bdc5cf2e10');
                } else {
                    acc[chain.id] = http();
                }
                return acc;
            }, {} as Record<number, ReturnType<typeof http>>),
            ssr: true,
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
    return createConfig({
        chains,
        transports: chains.reduce((acc, chain) => {
            if (chain.id === bsc.id) {
                acc[chain.id] = http('https://rpc.ankr.com/bsc/43e5f2a7dbfddf572c74f1b3b07cc450e42d68d64fa30ea90efb41bdc5cf2e10');
            } else {
                acc[chain.id] = http();
            }
            return acc;
        }, {} as Record<number, ReturnType<typeof http>>),
        ssr: true,
    });
}
