import { CustomChainConfig, WEB3AUTH_NETWORK, Web3AuthOptions } from "@web3auth/modal";
import { Web3AuthContextConfig } from "@web3auth/modal/react";

// BLmoJjY2HHXDmb4rxc5Z-vjdIzJZZ3Q1_LtInJrSGO_GRqxa1vmiWPSKb0IH8E7C7mZb8MSabu7q9PKBu0PDtBY
export const arbitrumSepolia: CustomChainConfig = {
    chainNamespace: "eip155",
    chainId: "0x66eee",
    rpcTarget: "https://api.web3auth.io/infura-service/v1/0x66eee/BLmoJjY2HHXDmb4rxc5Z-vjdIzJZZ3Q1_LtInJrSGO_GRqxa1vmiWPSKb0IH8E7C7mZb8MSabu7q9PKBu0PDtBY",
    blockExplorerUrl: "https://sepolia.arbiscan.io",
    logo: "https://images.web3auth.io/chains/42161.svg",
    tickerName: "Arbitrum Sepolia Ether",
    ticker: "ETH",
    displayName: "Arbitrum Sepolia",
}

export const clientId = "BLmoJjY2HHXDmb4rxc5Z-vjdIzJZZ3Q1_LtInJrSGO_GRqxa1vmiWPSKb0IH8E7C7mZb8MSabu7q9PKBu0PDtBY";

const web3AuthOptions: Web3AuthOptions = {
    clientId: clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    defaultChainId: "0x66eee",
    chains: [arbitrumSepolia],
};

const web3AuthContextConfig: Web3AuthContextConfig = {
    web3AuthOptions,
};

export default web3AuthContextConfig;
