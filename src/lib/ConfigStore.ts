import { ConfigResponse } from "b5-api-client/dist/types";
import { p2pMarketAPIClient } from "./APIClients";
import { BlockchainName } from "../components/web3/Web3RPCClientManager";
import { Stablecoin, StablecoinConfig } from "../components/web3/types";

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
                name: "ARBITRUM_TESTNET",
                escrow_address: "0xA3C6696665F62928c908ed5b729Ef7CF7566B57a",
                supported_coins: [{
                    token_code: "USDK",
                    address: "0x3cfA72437c8992D417e154f92308b5A2EA07EDbc"
                }]
            }
        ]
    }
};

export class ConfigStore {
    private static instance: ConfigStore;
    private config?: ConfigResponse<any>; // Initialize with default config
    private backendStablecoins?: StablecoinConfig

    public static getInstance(): ConfigStore {
        if (!ConfigStore.instance) {
            ConfigStore.instance = new ConfigStore();
        }
        return ConfigStore.instance;
    }

    public setConfig(config: ConfigResponse<any>) {
        this.config = config;
    }

    public setBackendStablecoins(values: any) {
        this.backendStablecoins = values
    }

    public getBackendStablecoins(): StablecoinConfig | undefined {
        return this.backendStablecoins;
    }

    public getConfig(): ConfigResponse<any> | undefined {
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

    public getChainIdFromBlockchain(blockchain: string | undefined): number {
        if (!blockchain) return 0;
        const chainConfig = this.config?.config.blockchains.find(
            (b: { name: string; chainId: number }) => b.name === blockchain
        );
        return chainConfig?.chainId ?? 0;
    }

    public getMaxPriorityFeePerGasGwei(blockchain: string): number {
        const chainConfig = this.config?.config.blockchains.find(
            (b: any) => b.name === blockchain
        );
        return chainConfig?.maxPriorityFeePerGasGwei ?? 0.03; // fallback to a safe default
    }
}

export function initConfig() {
    if (ConfigStore.getInstance().getConfig() === undefined) {
        p2pMarketAPIClient.getConfig().then((config: ConfigResponse<any>) => {
            ConfigStore.getInstance().setConfig(config);
            ConfigStore.getInstance().setBackendStablecoins(mapBlockchainsToStablecoinConfig(config.config))
        }).catch((error: any) => {
            ConfigStore.getInstance().setConfig(DEFAULT_CONFIG)
            console.error("Failed to load configuration:", error);
        });
    } else {

    }
}

export const getBlockchainDisplayName = (blockchain: BlockchainName): string => {
    switch (blockchain) {
        case BlockchainName.ARBITRUM_TESTNET:
            return "Arbitrum Sepolia";
        case BlockchainName.RSK_TESTNET:
            return "Rootstock Testnet";
        case BlockchainName.BASE_SEPOLIA:
            return "Base Sepolia";
        case BlockchainName.BASE_MAINNET:
            return "Base Mainnet";
        case BlockchainName.ARBITRUM_MAINNET:
            return "Arbitrum Mainnet";
    }
};

function mapBlockchainsToStablecoinConfig(config: any): StablecoinConfig {
    const blockchains = config.blockchains;
    const supportedStablecoins = blockchains.map((blockchain: any) => {
        return blockchain.supportedCoins.map((coin: any) => (
            {
                addresses: [
                    {
                        blockchain: blockchain.name,
                        address: coin.address,
                    },
                ],
                name: coin.tokenCode,
            }));
    }).flat();
    return { supportedStablecoins };
}
