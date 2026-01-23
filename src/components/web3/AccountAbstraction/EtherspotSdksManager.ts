import { EtherspotBundler, SdkOptions, PrimeSdk } from "@etherspot/prime-sdk";
import { ConfigStore, ChainId, BlockchainName, BackendBlockchainConfig } from "../../../lib/ConfigStore";
import { getAddress } from "viem";
import { TokenBalance } from "../types";
import { PublicClientManager } from "../PublicClientManager";
import { ERC20abi } from "@/components/web3/abis/StablecoinConfig";

export class EtherspotSdksManager {
    private static instance: EtherspotSdksManager;
    private sdkOptionsMap: Record<ChainId, SdkOptions> | null = null;

    private constructor() { }

    public async createPrimeSdk(walletProvider: any, chainId: number): Promise<PrimeSdk | null> {
        const sdkOptions = await this.getSdkOptionsForChainId(chainId);
        if (!sdkOptions) {
            console.warn(`No SDK options available for chain ${chainId}`);
            return null;
        }
        const primeSdk = new PrimeSdk(walletProvider, sdkOptions);
        if (primeSdk !== null) {
            return primeSdk;
        }
        console.error(`Failed to create PrimeSdk for chain ${chainId}, ${JSON.stringify(walletProvider)}`);
        return null;
    }

    public async getTokensBalances(primeSdk: PrimeSdk) {
        if (primeSdk) {
            const smartWalletAddress = await primeSdk?.getCounterFactualAddress();
            const currentBlockchain = this.mapNetworkNameToFormattedName(
                primeSdk?.state.network.name
            )!!;

            const balances = await this.fetchStablecoinBalances(
                smartWalletAddress,
                currentBlockchain
            );

            return balances;
        }
    };

    // Function to fetch balances for stablecoins on a given blockchain
    private async fetchStablecoinBalances(
        smartWalletAddress: string,
        currentBlockchain: string
    ): Promise<TokenBalance[]> {
        const tokenBalances: TokenBalance[] = [];

        try {
            const configStore = ConfigStore.getInstance();
            const stablecoinsByBlockchain =
                configStore.getStablecoinsByBlockchain(currentBlockchain);
            const chainId = configStore.getChainIdFromBlockchain(currentBlockchain);
            // Use Promise.all to fetch balances concurrently for better performance
            await Promise.all(
                stablecoinsByBlockchain.map(async (stablecoin) => {
                    const relevantAddresses = stablecoin.addresses.filter(
                        (address) => address.blockchain === currentBlockchain
                    );
                    for (const { address: tokenAddress } of relevantAddresses) {
                        try {
                            const swTokenBalance = await this.getStablecoinBalance(tokenAddress, smartWalletAddress, chainId)

                            // Map the balances to the TokenBalance type
                            tokenBalances.push({
                                name: stablecoin.name ?? "Unknown",
                                eoaBalance: "0",
                                smartWalletBalance: swTokenBalance?.toString() ?? "0",
                                address:
                                    tokenAddress ?? "0x0000000000000000000000000000000000000000",
                                decimals: stablecoin.decimals ?? 6,
                            });
                        } catch (balanceError) {
                            console.error(
                                `Error fetching balance for ${stablecoin.name} at address ${tokenAddress}:`,
                                balanceError
                            );
                        }
                    }
                })
            );
        } catch (error) {
            console.error("Error fetching stablecoin balances:", error);
        }

        return tokenBalances;
    }

    private async getStablecoinBalance(
        tokenAddress: string,
        walletAddress: string,
        chainId: number
    ): Promise<BigInt | undefined> {
        const client = PublicClientManager.getInstance({ chainId });
        const balance = await client.readContract({
            address: getAddress(tokenAddress),
            abi: ERC20abi,
            functionName: "balanceOf",
            args: [walletAddress],
        });
        if (balance !== undefined && balance !== null) {
            const formattedBalance = BigInt(balance.toString());
            return formattedBalance;
        }
    };

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
                    isTestnet ? "etherspot_public_key" : process.env.NEXT_PUBLIC_ARKA_KEY ?? '',
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

    public mapNetworkNameToFormattedName(
        networkName: string | undefined
    ): string | null {
        if (!networkName) {
            return null;
        }
        return networkNameToFormattedNameMap[networkName] || null;
    }
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




