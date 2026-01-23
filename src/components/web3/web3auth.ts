import { CustomChainConfig, WEB3AUTH_NETWORK, Web3AuthOptions, CONFIRMATION_STRATEGY } from "@web3auth/modal";
import { WS_EMBED_LOGIN_MODE } from "@web3auth/ws-embed";
import { Web3AuthContextConfig } from "@web3auth/modal/react";

const web3AuthClientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ?? "";

export const arbitrumSepolia: CustomChainConfig = {
    chainNamespace: "eip155",
    chainId: "0x66eee",
    rpcTarget: `https://api.web3auth.io/infura-service/v1/0x66eee/${web3AuthClientId}`,
    blockExplorerUrl: "https://sepolia.arbiscan.io",
    logo: "https://images.web3auth.io/chains/42161.svg",
    tickerName: "Arbitrum Sepolia Ether",
    ticker: "ETH",
    displayName: "Arbitrum Sepolia",
};

export const arbitrumOne: CustomChainConfig = {
    chainNamespace: "eip155",
    chainId: "0xa4b1",
    rpcTarget: `https://api.web3auth.io/infura-service/v1/0xa4b1/${web3AuthClientId}`,
    blockExplorerUrl: "https://arbiscan.io",
    logo: "https://images.web3auth.io/chains/42161.svg",
    tickerName: "Ethereum",
    ticker: "ETH",
    displayName: "Arbitrum One",
};

export const base: CustomChainConfig = {
    chainNamespace: "eip155",
    chainId: "0x2105",
    rpcTarget: `https://api.web3auth.io/infura-service/v1/0x2105/${web3AuthClientId}`,
    blockExplorerUrl: "https://basescan.org",
    logo: "https://images.web3auth.io/chains/8453.svg",
    tickerName: "Ethereum",
    ticker: "ETH",
    displayName: "Base",
};

export const bnb: CustomChainConfig = {
    chainNamespace: "eip155",
    chainId: "0x38",
    rpcTarget: `https://api.web3auth.io/infura-service/v1/0x38/${web3AuthClientId}`,
    blockExplorerUrl: "https://bscscan.com",
    logo: "https://images.web3auth.io/chains/56.svg",
    tickerName: "BNB",
    ticker: "BNB",
    displayName: "BNB Smart Chain",
};

const web3AuthOptions: Web3AuthOptions = {
    clientId: web3AuthClientId,
    web3AuthNetwork: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? WEB3AUTH_NETWORK.SAPPHIRE_MAINNET : WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    defaultChainId: "0x38",
    chains: [bnb, base, arbitrumOne, arbitrumSepolia],
    walletServicesConfig: {
        confirmationStrategy: CONFIRMATION_STRATEGY.AUTO_APPROVE,
        loginMode: WS_EMBED_LOGIN_MODE.EMBED,
    },
};

const web3AuthContextConfig: Web3AuthContextConfig = {
    web3AuthOptions,
};

export default web3AuthContextConfig;
