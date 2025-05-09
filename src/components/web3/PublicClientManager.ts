import { createPublicClient, http, PublicClient } from 'viem';
import { rootstockTestnet, arbitrumSepolia, baseSepolia, base, arbitrum, bsc, polygon } from "wagmi/chains";

interface PublicClientConfig {
    chainId: number;
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
                    transport: http('https://rpc.ankr.com/bsc/100aaa5748c3b0467dcea9f3f096568697028026ed9dd75284a413f34c87ab90'),
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
