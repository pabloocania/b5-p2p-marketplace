import { StablecoinConfig } from "@/components/web3/types";
import ERC20 from "./ERC20.json";

export const defaultSystemStablecoins: StablecoinConfig = {
    supportedStablecoins: [
        {
            addresses: [
                {
                    blockchain: "RSK_TESTNET",
                    address: "0xee5e8291b551603a19ef41eea69ae49592ed14f8",
                }
            ],
            name: "PDOC",
            escrowAddress: "0x0000000000000000000000000000000000000000",
            decimals: 18
        }
    ]
} as const;

export const ERC20abi = ERC20
