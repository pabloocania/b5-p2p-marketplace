import { EtherspotBundler, SdkOptions } from "@etherspot/prime-sdk";
import { ChainId } from "./PublicClientManager";

// Define SDK options for each chain
const sdkOptionsMap: Record<ChainId, SdkOptions> = {
    [ChainId.ARBITRUM_TESTNET]: {
        chainId: ChainId.ARBITRUM_TESTNET,
        bundlerProvider: new EtherspotBundler(
            ChainId.ARBITRUM_TESTNET,
            "etherspot_public_key",
            "https://testnet-rpc.etherspot.io/v1/" + ChainId.ARBITRUM_TESTNET
        ),
    },
    [ChainId.RSK_TESTNET]: {
        chainId: ChainId.RSK_TESTNET,
        bundlerProvider: new EtherspotBundler(
            ChainId.RSK_TESTNET,
            "etherspot_public_key",
            "https://testnet-rpc.etherspot.io/v1/" + ChainId.RSK_TESTNET
        ),
    },
    [ChainId.BASE_SEPOLIA]: {
        chainId: ChainId.BASE_SEPOLIA,
        bundlerProvider: new EtherspotBundler(
            ChainId.BASE_SEPOLIA,
            "etherspot_public_key",
            "https://testnet-rpc.etherspot.io/v1/" + ChainId.BASE_SEPOLIA
        ),
    },
    [ChainId.BASE_MAINNET]: {
        chainId: ChainId.BASE_MAINNET,
        bundlerProvider: new EtherspotBundler(
            ChainId.BASE_MAINNET,
            "etherspot_public_key",
            "https://rpc.etherspot.io/v1/" + ChainId.BASE_MAINNET
        ),
    },
    [ChainId.ARBITRUM_MAINNET]: {
        chainId: ChainId.ARBITRUM_MAINNET,
        bundlerProvider: new EtherspotBundler(
            ChainId.ARBITRUM_MAINNET,
            "etherspot_public_key",
            "https://rpc.etherspot.io/v1/" + ChainId.ARBITRUM_MAINNET
        ),
    }
};

// Function to get SDK options for a given chain ID
export function getSdkOptionsForChainId(chainId: ChainId): SdkOptions {
    const options = sdkOptionsMap[chainId];
    if (options) {
        return options;
    }
    throw new Error(`Unsupported chain ID: ${chainId}`);
}

// Mapping of network names to formatted blockchain names
export const networkNameToFormattedNameMap: Record<string, string> = {
    baseSepolia: "BASE_SEPOLIA",
    sepolia: "SEPOLIA",
    optimism: "OPTIMISM",
    polygon: "POLYGON",
    arbitrum: "ARBITRUM",
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
    base: "BASE",
    bsc: "BSC",
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
    amoy: "AMOY",
};




