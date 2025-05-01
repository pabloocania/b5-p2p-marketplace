import KioscoinEscrow from "./KioscoinEscrow.json";

export const KioscoinEscrowContractConfig = {
    blockchains: [
        {
            name: "RSK_TESTNET",
            address: "0xE861ac748D1cBE22398419E8F27f6C1bB544a79D"
        },
        {
            name: "ARBITRUM_TESTNET",
            address: "0xA3C6696665F62928c908ed5b729Ef7CF7566B57a"
        }
    ],
    abi: KioscoinEscrow,
} as const;

export const getKioscoinEscrowAddressByBlockchain = (blockchainName: string): string => {
    const blockchain = KioscoinEscrowContractConfig.blockchains.find(
        (b) => b.name === blockchainName
    );
    return blockchain?.address!!;
};

