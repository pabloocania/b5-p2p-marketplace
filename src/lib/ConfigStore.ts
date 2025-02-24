import { ConfigResponse } from "b5-api-client/dist/types";
import { p2pMarketAPIClient } from "./APIClients";
import { BlockchainName } from "./web3/PublicClientManager";

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
                supported_coins: [
                    "USDK"
                ]
            }
        ]
    }
};

export class ConfigStore {
    private static instance: ConfigStore;
    private config: ConfigResponse<any> = DEFAULT_CONFIG; // Initialize with default config

    private constructor() { }

    public static getInstance(): ConfigStore {
        if (!ConfigStore.instance) {
            ConfigStore.instance = new ConfigStore();
        }
        return ConfigStore.instance;
    }

    public setConfig(config: ConfigResponse<any>) {
        this.config = config;
    }

    public getConfig(): ConfigResponse<any> {
        return this.config;
    }
}

export function initConfig() {
    p2pMarketAPIClient.getConfig().then((config: ConfigResponse<any>) => {
        ConfigStore.getInstance().setConfig(config);
    }).catch((error: any) => {
        console.error("Failed to load configuration:", error);
    });
}

export const getBlockchainDisplayName = (blockchain: BlockchainName): string => {
    switch (blockchain) {
        case BlockchainName.ARBITRUM_TESTNET:
            return "Arbitrum Sepolia";
        case BlockchainName.RSK_TESTNET:
            return "Rootstock Testnet";
    }
};
