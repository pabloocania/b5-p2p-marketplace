import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { PrimeSdk, SdkOptions, EtherspotBundler } from "@etherspot/prime-sdk";
import { ERC20ContractConfig } from "../../abis/ERC20ContractConfig";
import { rootstockTestnet } from "wagmi/chains";
import { createPublicClient, http, getAddress, formatUnits } from "viem";

const publicClient = createPublicClient({
  chain: rootstockTestnet,
  transport: http(),
});

interface Stablecoin {
  name: string;
  eoaBalance: string;
  smartWalletBalance: string;
}

interface EtherspotSdkContextType {
  primeSdk: PrimeSdk | null;
  swAddress: string;
  stablecoin: Stablecoin | null;
}

const EtherspotSdkContext = createContext<EtherspotSdkContextType | undefined>(
  undefined
);

export const EtherspotSdkProvider: React.FC = ({ children }) => {
  const { address, isConnected } = useAccount();
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
  const [swAddress, setSwAddress] = useState<string>("");
  const [stablecoin, setStablecoin] = useState<Stablecoin | null>(null);
  const { data: walletClient } = useWalletClient();
  const account = useAccount();

  useEffect(() => {
    const connectToSdk = async () => {
      console.log("inside SDK");
      if (walletClient && isConnected && !primeSdk) {
        const options: SdkOptions = {
          chainId: 31, // Rootstock Testnet chain ID
          rpcProviderUrl: "https://public-node.testnet.rsk.co", // Rootstock Testnet RPC URL
          bundlerProvider: new EtherspotBundler(
            31,
            "eyJvcmciOiI2NTIzZjY5MzUwOTBmNzAwMDFiYjJkZWIiLCJpZCI6ImE3MDA0NWM5Y2IyNTQ3ODA5ZTgwOTVjNzUwYjAyYzM1IiwiaCI6Im11cm11cjEyOCJ9",
            "https://rootstocktestnet-bundler.etherspot.io/"
          ),
        };
        const walletProvider = {
          ...walletClient,
          address: address ?? "0x0000000000000000000000000000000000000000",
          signMessage: async (message: string) => {
            console.log(account.address);
            return walletClient.signMessage({
              message: { raw: message },
            });
          },
          signTypedData: async (params: any) => {
            // Implement the signTypedData method as needed
            return walletClient.signTypedData(params);
          },
        };
        const primeSdkInstance = new PrimeSdk(walletProvider, options);
        if (primeSdkInstance !== null) {
          console.log("Prime SDK initialized:", primeSdkInstance);
          const balance = await primeSdkInstance?.getNativeBalance();
          console.log("Prime SDK RBTC:", balance);
          const smartWalletAddress =
            await primeSdkInstance?.getCounterFactualAddress();
          console.log("Etherspot account Address:", smartWalletAddress);
          setSwAddress(smartWalletAddress);
          const smartWalletBalance = await getBalance(
            ERC20ContractConfig.address,
            smartWalletAddress
          );

          const eoaBalance = await getBalance(
            ERC20ContractConfig.address,
            getAddress(address!)
          );

          const balances = {
            eoaBalance: eoaBalance ? eoaBalance : "",
            smartWalletBalance: smartWalletBalance ? smartWalletBalance : "",
            name: ERC20ContractConfig.name,
          };

          setStablecoin(balances);
          setPrimeSdk(primeSdkInstance);
        }
      }
    };

    connectToSdk();
  }, [walletClient, isConnected, address, primeSdk]);

  const getBalance = async (tokenAddress: string, walletAddress: string) => {
    const balance = await publicClient.readContract({
      address: getAddress(tokenAddress),
      abi: ERC20ContractConfig.abi,
      functionName: "balanceOf",
      args: [walletAddress],
    });
    if (balance !== undefined && balance !== null) {
      const formattedBalance = BigInt(balance.toString());
      return formatUnits(formattedBalance, 18);
    }
  };

  return (
    <EtherspotSdkContext.Provider value={{ primeSdk, swAddress, stablecoin }}>
      {children}
    </EtherspotSdkContext.Provider>
  );
};

export const useEtherspotSdk = () => {
  const context = useContext(EtherspotSdkContext);
  if (context === undefined) {
    throw new Error(
      "useEtherspotSdk must be used within an EtherspotSdkProvider"
    );
  }
  return context;
};
