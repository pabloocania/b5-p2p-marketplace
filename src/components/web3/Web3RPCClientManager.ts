import { createPublicClient, http, PublicClient } from 'viem';
import { rootstockTestnet, arbitrumSepolia, baseSepolia, base, arbitrum, bsc, polygon } from "wagmi/chains";

interface PublicClientConfig {
    chainId: number;
}

// Enum for blockchain names
export enum BlockchainName {
    ARBITRUM_TESTNET = "ARBITRUM_TESTNET",
    ARBITRUM_MAINNET = "ARBITRUM_MAINNET",
    RSK_TESTNET = "RSK_TESTNET",
    BASE_SEPOLIA = "BASE_SEPOLIA",
    BASE_MAINNET = "BASE_MAINNET",
    BSC_MAINNET = "BSC_MAINNET",
    POLYGON_MAINNET = "POLYGON_MAINNET",
    // Add more blockchain names as needed
}

// Enum for chain IDs
export enum ChainId {
    ARBITRUM_TESTNET = 421614,
    ARBITRUM_MAINNET = 42161,
    RSK_TESTNET = 31,
    BASE_SEPOLIA = 84532,
    BASE_MAINNET = 8453,
    BSC_MAINNET = 56,
    POLYGON_MAINNET = 137,
    // Add more chain IDs as needed
}

export class BlockchainMapper {
    // Function to get the chain ID for a given blockchain name
    public static getChainIdForBlockchainName(blockchainName: BlockchainName): ChainId {
        const chainId = ChainId[blockchainName];
        if (chainId !== undefined) {
            return chainId;
        }
        throw new Error(`Unsupported blockchain name: ${blockchainName}`);
    }

    // Function to get the blockchain name for a given chain ID
    public static getBlockchainNameByChainId(chainId: ChainId): BlockchainName {
        const blockchainName = Object.keys(ChainId).find(
            key => ChainId[key as keyof typeof ChainId] === chainId
        ) as BlockchainName | undefined;

        if (blockchainName) {
            return blockchainName;
        }
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
}

export class PublicClientManager {
    private static instance: PublicClient | null = null;

    public static getInstance(config: PublicClientConfig) {
        this.resetInstance()
        if (!PublicClientManager.instance) {
            PublicClientManager.instance = PublicClientManager.createClient(config) as unknown as PublicClient;
        }
        return PublicClientManager.instance;
    }

    private static createClient({ chainId }: PublicClientConfig) {
        switch (chainId) {
            case 421614: // Arbitrum Testnet Chain ID
                return createPublicClient({
                    chain: arbitrumSepolia,
                    transport: http(),
                });
            case 31: // RSK Testnet Chain ID
                return createPublicClient({
                    chain: rootstockTestnet,
                    transport: http(),
                });
            case 84532: // Base Sepolia Chain ID
                return createPublicClient({
                    chain: baseSepolia,
                    transport: http(),
                });
            case 8453: // Base Mainnet Chain ID
                return createPublicClient({
                    chain: base,
                    transport: http(),
                });
            case 42161: // Arbitrum Mainnet Chain ID
                return createPublicClient({
                    chain: arbitrum,
                    transport: http(),
                });
            case 56: // BNB Mainnet Chain ID
                return createPublicClient({
                    chain: bsc,
                    transport: http(),
                });
            case 137: // Polygon Mainnet Chain ID
                return createPublicClient({
                    chain: polygon,
                    transport: http(),
                });
            default:
                throw new Error(`Unsupported chain ID: ${chainId}`);
        }
    }

    public static resetInstance() {
        PublicClientManager.instance = null;
    }

    // New method to get chainId based on blockchain name
    public static getChainIdForBlockchain(blockchain: string): number {
        switch (blockchain.toUpperCase()) {
            case "ARBITRUM_TESTNET":
                return 421614;
            case "RSK_TESTNET":
                return 31;
            case "BASE_SEPOLIA":
                return 84532;
            case "BASE_MAINNET":
                return 8453;
            case "ARBITRUM_MAINNET":
                return 42161;
            case "BSC_MAINNET":
                return 56;
            case "POLYGON_MAINNET":
                return 137;
            default:
                throw new Error(`Unsupported blockchain: ${blockchain}`);
        }
    }
}
