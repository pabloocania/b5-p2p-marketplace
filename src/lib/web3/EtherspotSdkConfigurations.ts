import { EtherspotBundler, SdkOptions } from "@etherspot/prime-sdk";
import { ChainId } from "./PublicClientManager";

// Define SDK options for each chain
const sdkOptionsMap: Record<ChainId, SdkOptions> = {
    [ChainId.ARBITRUM_TESTNET]: {
        chainId: ChainId.ARBITRUM_TESTNET,
        bundlerProvider: new EtherspotBundler(
            ChainId.ARBITRUM_TESTNET,
            "etherspot_3ZVooGBfUwejKEQFJzmvMxKK",
            "https://testnet-rpc.etherspot.io/v2/" + ChainId.ARBITRUM_TESTNET
        ),
    },
    [ChainId.RSK_TESTNET]: {
        chainId: ChainId.RSK_TESTNET,
        bundlerProvider: new EtherspotBundler(
            ChainId.RSK_TESTNET,
            "eyJvcmciOiI2NTIzZjY5MzUwOTBmNzAwMDFiYjJkZWIiLCJpZCI6ImUzZmE2NzQ2ZDI3MTQ4ZWQ4OTYyNjg3YzQ2MzJjMDE4IiwiaCI6Im11cm11cjEyOCJ9",
            "https://rootstocktestnet-bundler.etherspot.io/"
        ),
    },
    // Add more mappings as needed
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




