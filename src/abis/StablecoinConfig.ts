import { Stablecoin, StablecoinConfig } from "@/lib/web3/types";
import ERC20 from "./ERC20.json";

export const systemStablecoins: StablecoinConfig = {
    supportedStablecoins: [
        {
            addresses: [
                {
                    blockchain: "RSK_TESTNET",
                    address: "0xee5e8291b551603a19ef41eea69ae49592ed14f8"
                }
            ],
            name: "PDOC",
        },
        {
            addresses: [
                {
                    blockchain: "ARBITRUM_TESTNET",
                    address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
                }
            ],
            name: "USDC",
        },
        {
            addresses: [
                {
                    blockchain: "ARBITRUM_TESTNET",
                    address: "0x3cfA72437c8992D417e154f92308b5A2EA07EDbc"
                }
            ],
            name: "USDK",
        }
    ]
} as const;

export const ERC20abi = ERC20

export const getStablecoinsByBlockchain = (blockchain: string): Stablecoin[] => {
    return systemStablecoins.supportedStablecoins.filter(stablecoin =>
        stablecoin.addresses.some(address => address.blockchain === blockchain)
    );
};

export const getTokenAddressByNameAndBlockchain = (tokenName: string, blockchain: string): string => {
    const stablecoin = systemStablecoins.supportedStablecoins.find(stablecoin =>
        stablecoin.name === tokenName &&
        stablecoin.addresses.some(address => address.blockchain === blockchain)
    );

    return stablecoin?.addresses.find(address => address.blockchain === blockchain)?.address!!;
};
