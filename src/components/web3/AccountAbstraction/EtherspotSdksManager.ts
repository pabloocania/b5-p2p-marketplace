import { EtherspotBundler, SdkOptions } from "@etherspot/prime-sdk";
import { ConfigStore, ChainId, BlockchainName, BackendBlockchainConfig } from "../../../lib/ConfigStore";

class EtherspotSdksManager {
    private static instance: EtherspotSdksManager;
    private sdkOptionsMap: Record<ChainId, SdkOptions> | null = null;

    private constructor() { }

    public static getInstance(): EtherspotSdksManager {
        if (!EtherspotSdksManager.instance) {
            EtherspotSdksManager.instance = new EtherspotSdksManager();
        }
        return EtherspotSdksManager.instance;
    }

    private async createSdkOptionsMap(): Promise<Record<ChainId, SdkOptions>> {
        const config = await ConfigStore.getInstance().getConfig();
        if (!config) {
            throw new Error('Configuration not loaded');
        }

        const sdkOptionsMap: Record<ChainId, SdkOptions> = {};

        config.config.blockchains.forEach((blockchain: BackendBlockchainConfig) => {
            // Skip if blockchain is not enabled or has no supported coins
            if (!blockchain.supportedCoins || blockchain.supportedCoins.length === 0) {
                console.warn(`Skipping blockchain ${blockchain.name} as it has no supported coins`);
                return;
            }

            const chainId = blockchain.chainId;
            const isTestnet = blockchain.name.toLowerCase().includes('testnet');

            sdkOptionsMap[chainId] = {
                chainId: chainId,
                bundlerProvider: new EtherspotBundler(
                    chainId,
                    isTestnet ? "etherspot_public_key" : "etherspot_3ZVooGBfUwejKEQFJzmvMxKK",
                    isTestnet
                        ? `https://testnet-rpc.etherspot.io/v1/${chainId}`
                        : `https://rpc.etherspot.io/v1/${chainId}`
                ),
            };
        });

        return sdkOptionsMap;
    }

    public async getSdkOptionsForChainId(chainId: ChainId): Promise<SdkOptions | null> {
        if (!this.sdkOptionsMap) {
            this.sdkOptionsMap = await this.createSdkOptionsMap();
        }

        const options = this.sdkOptionsMap[chainId];
        if (options) {
            return options;
        }
        return null;
    }

    public invalidateCache(): void {
        this.sdkOptionsMap = null;
    }
}

// Function to get SDK options for a given chain ID
export function getSdkOptionsForChainId(chainId: ChainId): Promise<SdkOptions | null> {
    return EtherspotSdksManager.getInstance().getSdkOptionsForChainId(chainId);
}

// Mapping of network names to formatted blockchain names
export const networkNameToFormattedNameMap: Record<string, BlockchainName> = {
    baseSepolia: "BASE_SEPOLIA",
    sepolia: "SEPOLIA",
    optimism: "OPTIMISM",
    polygon: "POLYGON_MAINNET",
    arbitrum: "ARBITRUM_MAINNET",
    arbitrumSepolia: "ARBITRUM_TESTNET",
    chiado: "CHIADO",
    fuse: "FUSE",
    fuseSparknet: "FUSE_SPARKNET",
    gnosis: "GNOSIS",
    kromaTestnet: "KROMA_TESTNET",
    mainnet: "MAINNET",
    optimismSepolia: "OPTIMISM_SEPOLIA",
    rootstock: "ROOTSTOCK",
    rootstockTestnet: "RSK_TESTNET",
    verseTestnet: "VERSE_TESTNET",
    mantle: "MANTLE",
    mantleSepolia: "MANTLE_SEPOLIA",
    avalanche: "AVALANCHE",
    base: "BASE_MAINNET",
    bsc: "BSC_MAINNET",
    bscTestnet: "BSC_TESTNET",
    fuji: "FUJI",
    linea: "LINEA",
    lineaTestnet: "LINEA_TESTNET",
    flareTestnet: "FLARE_TESTNET",
    flare: "FLARE",
    scrollSepolia: "SCROLL_SEPOLIA",
    scroll: "SCROLL",
    ancient8Testnet: "ANCIENT8_TESTNET",
    ancient8: "ANCIENT8",
    amoy: "AMOY"
};




