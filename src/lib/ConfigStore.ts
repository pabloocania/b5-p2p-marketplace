import { ConfigResponse, PaymentMethod } from "b5-api-client/dist/types";
import { p2pMarketAPIClient } from "./APIClients";
import { Stablecoin, StablecoinConfig } from "../components/web3/types";
import { arbitrumSepolia, baseSepolia, rootstock, rootstockTestnet, base, arbitrum, type Chain, bsc, polygon } from "wagmi/chains";

// Backend configuration types
export interface BackendSupportedCoin {
    readonly tokenCode: string;
    readonly address: string;
    readonly decimals: number;
}

export interface BackendBlockchainConfig {
    readonly name: string;
    readonly escrowAddress: string;
    readonly supportedCoins: BackendSupportedCoin[];
    readonly chainId: number;
    readonly maxPriorityFeePerGasGwei: number;
}

// Type for blockchain names from backend
export type BlockchainName = string;

// Type for chain IDs from backend
export type ChainId = number;

const DEFAULT_CONFIG: ConfigResponse<any> = {
    config: {
        firebase: {
            api_key: "",
            auth_domain: "b5-kioscoin-dev.firebaseapp.com",
            project_id: "b5-kioscoin-dev",
            storage_bucket: "b5-kioscoin-dev.firebasestorage.app",
            messaging_sender_id: "",
            app_id: "",
            measurement_id: "",
            vapid_key: ""
        },
        blockchains: [
            {
                name: "BSC_MAINNET",
                chainId: 56,
                escrowAddress: "",
                supportedCoins: [{
                    tokenCode: "USDK",
                    address: "",
                    decimals: 6
                }]
            }
        ]
    }
};

export class ConfigStore {
    private static instance: ConfigStore;
    private config?: ConfigResponse<any>;
    private backendStablecoins?: StablecoinConfig;
    private isInitialized: boolean = false;
    private initializationPromise?: Promise<void>;

    private constructor() {
        // Private constructor to enforce singleton pattern
    }

    public static getInstance(): ConfigStore {
        if (!ConfigStore.instance) {
            ConfigStore.instance = new ConfigStore();
        }
        return ConfigStore.instance;
    }

    private async initialize(): Promise<void> {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = new Promise((resolve, reject) => {
            p2pMarketAPIClient.getConfig()
                .then((config: ConfigResponse<any>) => {
                    this.setConfig(config);
                    this.setBackendStablecoins(mapBlockchainsToStablecoinConfig(config.config));
                    resolve();
                })
                .catch((error: any) => {
                    this.setConfig(DEFAULT_CONFIG);
                    console.error("Failed to load configuration:", error);
                    resolve(); // Still resolve to prevent hanging
                });
        });
        return this.initializationPromise;
    }

    public setConfig(config: ConfigResponse<any>) {
        this.config = Object.freeze(config);
        this.isInitialized = true;
    }

    public setBackendStablecoins(values: any) {
        this.backendStablecoins = Object.freeze(values);
    }

    public getBackendStablecoins(): StablecoinConfig | undefined {
        if (!this.isInitialized) {
            throw new Error('ConfigStore not initialized. Call initConfig() first.');
        }
        return this.backendStablecoins;
    }

    public async getConfig(): Promise<ConfigResponse<any>> {
        return this.waitForConfig();
    }

    public async waitForConfig(): Promise<ConfigResponse<any>> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (!this.config) {
            throw new Error('Configuration not loaded');
        }

        return this.config;
    }

    public getStablecoinsByBlockchain = (blockchain: string): Stablecoin[] => {
        const stablecoins = ConfigStore.getInstance().getBackendStablecoins()?.supportedStablecoins || [];
        return stablecoins.filter(stablecoin =>
            stablecoin.addresses.some(address => address.blockchain === blockchain)
        );
    };

    public getTokenAddressByNameAndBlockchain = (tokenName: string, blockchain: string): string => {
        const stablecoin = this.backendStablecoins?.supportedStablecoins.find(stablecoin =>
            stablecoin.name === tokenName &&
            stablecoin.addresses.some(address => address.blockchain === blockchain)
        );

        return stablecoin?.addresses.find(address => address.blockchain === blockchain)?.address!!;
    };

    public getKioscoinEscrowAddressByBlockchain(blockchainName: string): string {
        return this.config?.config.blockchains.find(
            (b: any) => b.name === blockchainName
        )?.escrowAddress!!;
    };

    public getStablecoinByAddress(tokenAddress: string): Stablecoin | undefined {
        return this.backendStablecoins?.supportedStablecoins.find(stablecoin =>
            stablecoin.addresses.some(address => address.address === tokenAddress)
        );
    }

    public getTokenDecimals(tokenAddress: string): number {
        return this.getStablecoinByAddress(tokenAddress)?.decimals ?? 6;
    }

    public getTokenDecimalsByTokenCode(tokenCode: string | undefined): number {
        const stablecoin = this.backendStablecoins?.supportedStablecoins.find(stablecoin => {
            return stablecoin.name.toUpperCase() === tokenCode?.toUpperCase()
        });
        return stablecoin?.decimals ?? 6;
    }

    public getTokenDecimalsByTokenCodeAndBlockchain(
        tokenCode: string | undefined,
        blockchain: string
    ): number {
        const stablecoin = this.backendStablecoins?.supportedStablecoins.find(stablecoin =>
            stablecoin.name.toUpperCase() === tokenCode?.toUpperCase() &&
            stablecoin.addresses.some(addr => addr.blockchain === blockchain)
        );
        return stablecoin?.decimals ?? 6;
    }

    public getChainIdFromBlockchain(blockchain: string | undefined): number {
        if (!blockchain) return 0;
        const chainConfig = this.config?.config.blockchains.find(
            (b: BackendBlockchainConfig) => b.name === blockchain
        );
        return chainConfig?.chainId ?? 0;
    }

    public getMaxPriorityFeePerGasGwei(blockchain: string): number {
        const chainConfig = this.config?.config.blockchains.find(
            (b: BackendBlockchainConfig) => b.name === blockchain
        );
        return chainConfig?.maxPriorityFeePerGasGwei ?? 0.03; // fallback to a safe default
    }

    public getBlockchainName(chainId: ChainId): BlockchainName | undefined {
        if (!this.config) return undefined;

        const blockchain = this.config.config.blockchains.find(
            (b: BackendBlockchainConfig) => b.chainId === chainId
        );
        return blockchain?.name;
    }

    public isValidChainId(chainId: ChainId): boolean {
        return this.getBlockchainName(chainId) !== undefined;
    }

    public isValidBlockchainName(blockchainName: BlockchainName): boolean {
        return this.getChainIdFromBlockchain(blockchainName) !== 0;
    }

    public getAllChainIds(): ChainId[] {
        if (!this.config) return [];

        return this.config.config.blockchains.map(
            (b: BackendBlockchainConfig) => b.chainId
        );
    }

    public getAllBlockchainNames(): BlockchainName[] {
        if (!this.config) return [];

        return this.config.config.blockchains.map(
            (b: BackendBlockchainConfig) => b.name
        );
    }

    public async getEnabledChains(): Promise<readonly [Chain, ...Chain[]]> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (!this.backendStablecoins) {
            return [bsc] as const;
        }

        const enabledChains = this.backendStablecoins.supportedStablecoins
            .flatMap(stablecoin => stablecoin.addresses.map(addr => addr.blockchain))
            .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
            .map(blockchain => {
                switch (blockchain) {
                    case "ARBITRUM_TESTNET":
                        return arbitrumSepolia;
                    case "RSK_TESTNET":
                        return rootstockTestnet;
                    case "BASE_SEPOLIA":
                        return baseSepolia;
                    case "BASE_MAINNET":
                        return base;
                    case "ARBITRUM_MAINNET":
                        return arbitrum;
                    case "ROOTSTOCK_MAINNET":
                        return rootstock;
                    case "BSC_MAINNET":
                        return bsc;
                    case "POLYGON_MAINNET":
                        return polygon;
                    default:
                        return null;
                }
            })
            .filter((chain): chain is NonNullable<typeof chain> => chain !== null);

        // Ensure we always return a non-empty array with at least one chain
        if (enabledChains.length === 0) {
            return [bsc] as const;
        }

        // Create a new array with the first chain and the rest
        const [first, ...rest] = enabledChains;
        return [first, ...rest] as const;
    }

    public getChainIdsFromBlockchains(blockchains: string[]): number[] {
        if (!this.config) return [];

        return blockchains
            .map(blockchain => this.getChainIdFromBlockchain(blockchain))
            .filter(chainId => chainId !== 0); // Filter out invalid chain IDs
    }

    public getPaymentMethods(): PaymentMethod[] {
        const list = (this.config as any)?.config?.paymentMethods ?? [];
        return list.map((pm: any) => ({
            type: String(pm.type || '').toUpperCase() || 'FINTECH',
            entity: pm.entity || '',
        }));
    }
}

export async function initConfig() {
    const store = ConfigStore.getInstance();
    try {
        await store.getConfig();
    } catch {
        // If getConfig fails, it means we need to initialize
        p2pMarketAPIClient.getConfig().then((config: ConfigResponse<any>) => {
            store.setConfig(config);
            store.setBackendStablecoins(mapBlockchainsToStablecoinConfig(config.config))
        }).catch((error: any) => {
            store.setConfig(DEFAULT_CONFIG)
            console.error("Failed to load configuration:", error);
        });
    }
}

export const getBlockchainDisplayName = (blockchain: BlockchainName): string => {
    switch (blockchain) {
        case "ARBITRUM_TESTNET":
            return "Arbitrum Sepolia";
        case "RSK_TESTNET":
            return "Rootstock Testnet";
        case "BASE_SEPOLIA":
            return "Base Sepolia";
        case "BASE_MAINNET":
            return "Base";
        case "ARBITRUM_MAINNET":
            return "Arbitrum";
        case "BSC_MAINNET":
            return "Binance Smart Chain";
        case "POLYGON_MAINNET":
            return "Polygon";
        default:
            return "Unknown";
    }
};

function mapBlockchainsToStablecoinConfig(config: any): StablecoinConfig {
    const blockchains = config.blockchains;
    const supportedStablecoins: Stablecoin[] = blockchains.map((blockchain: any) => {
        return blockchain.supportedCoins.map((coin: any) => (
            {
                addresses: [
                    {
                        blockchain: blockchain.name,
                        address: coin.address,
                    },
                ],
                name: coin.tokenCode,
                escrowAddress: blockchain.escrowAddress,
                decimals: coin.decimals,
            }));
    }).flat();
    return { supportedStablecoins };
}

export async function getBlockchainNameByChainId(chainId: ChainId): Promise<BlockchainName> {
    const config = await ConfigStore.getInstance().getConfig();
    if (!config) {
        throw new Error('Configuration not loaded');
    }

    const blockchain = config.config.blockchains.find(
        (b: BackendBlockchainConfig) => b.chainId === chainId
    );

    if (!blockchain) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    return blockchain.name;
}
