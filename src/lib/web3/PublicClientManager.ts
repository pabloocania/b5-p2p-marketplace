import { createPublicClient, http, PublicClient } from 'viem';
import { rootstockTestnet, arbitrumSepolia } from "wagmi/chains";

interface PublicClientConfig {
    chainId: number;
}

// Enum for blockchain names
export enum BlockchainName {
    ARBITRUM_TESTNET = "ARBITRUM_TESTNET",
    RSK_TESTNET = "RSK_TESTNET",
    // Add more blockchain names as needed
}

// Enum for chain IDs
export enum ChainId {
    ARBITRUM_TESTNET = 421614,
    RSK_TESTNET = 31,
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
            PublicClientManager.instance = PublicClientManager.createClient(config);
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
            default:
                throw new Error(`Unsupported blockchain: ${blockchain}`);
        }
    }

}