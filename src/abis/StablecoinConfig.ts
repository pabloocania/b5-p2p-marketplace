import { StablecoinConfig } from "@/lib/web3/types";
import ERC20 from "./ERC20.json";

export const defaultSystemStablecoins: StablecoinConfig = {
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
