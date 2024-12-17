import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useSignTypedData, useWalletClient } from "wagmi";
import { PrimeSdk, SdkOptions, EtherspotBundler } from "@etherspot/prime-sdk";
import { ERC20ContractConfig } from "../../abis/ERC20ContractConfig";
import { rootstockTestnet } from "wagmi/chains";
import { createPublicClient, http, getAddress, formatUnits } from "viem";
import { TokenBalance } from "./types";
import { getBalance } from "@wagmi/core";
import { config } from "../../wagmi";

const publicClient = createPublicClient({
  chain: rootstockTestnet,
  transport: http(),
});

interface EtherspotSdkContextType {
  primeSdk: PrimeSdk | null;
  swAddress: string;
  balances: TokenBalance[];
  getTokensBalances: (sdkInstance: PrimeSdk) => {};
}

const EtherspotSdkContext = createContext<EtherspotSdkContextType | undefined>(
  undefined
);

export const EtherspotSdkProvider: React.FC = ({ children }) => {
  const { address, isConnected } = useAccount();
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
  const [smartWalletAddress, setSwAddress] = useState<string>("");
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const { data: walletClient } = useWalletClient();
  const account = useAccount();

  const createWalletProvider = () => ({
    ...walletClient,
    address: account.address ?? "0x0",
    signMessage: async (message: any) => {
      return walletClient!!.signMessage({
        message: { raw: message },
      });
    },
    signTypedData: async (params: any) => {
      return walletClient!!.signTypedData(params);
    },
  });

  const options: SdkOptions = {
    chainId: 31, // Rootstock Testnet chain ID
    bundlerProvider: new EtherspotBundler(
      31,
      "eyJvcmciOiI2NTIzZjY5MzUwOTBmNzAwMDFiYjJkZWIiLCJpZCI6ImUzZmE2NzQ2ZDI3MTQ4ZWQ4OTYyNjg3YzQ2MzJjMDE4IiwiaCI6Im11cm11cjEyOCJ9",
      // "https://rpc.etherspot.io/v2/30"
      "https://rootstocktestnet-bundler.etherspot.io/"
    ),
  };

  useEffect(() => {
    const connectToSdk = async () => {
      if (!walletClient && !isConnected && primeSdk) {
        primeSdk.destroy();
        console.log("DESTROYED: ", primeSdk);
        setPrimeSdk(null);
      }
      if (walletClient && isConnected && !primeSdk) {
        // const walletProvider = createWalletProvider();
        const walletProvider = createWalletProvider();
        if (!walletProvider.address) {
          throw new Error("Wallet provider address is undefined");
        }
        const primeSdkInstance = new PrimeSdk(walletProvider, options);
        if (primeSdkInstance !== null) {
          console.log("Prime SDK initialized:", primeSdkInstance);
          const smartWalletAddress =
            await primeSdkInstance?.getCounterFactualAddress();
          setSwAddress(smartWalletAddress);
          setPrimeSdk(primeSdkInstance);
          getTokensBalances(primeSdkInstance);
        }
      } else {
        console.log("wallet client:", walletClient);
        console.log("isConnected", isConnected);
        console.log("primeSdk", primeSdk);
      }
    };

    connectToSdk();
  }, [walletClient, isConnected]);

  const getTokensBalances = async (primeSdk?: PrimeSdk) => {
    const swNativeBalance = await primeSdk?.getNativeBalance();
    console.log(swNativeBalance);
    const smartWalletAddress = await primeSdk?.getCounterFactualAddress();
    console.log(smartWalletAddress);
    const eoaNativeBalance = await getBalance(config, {
      address: address ?? "0x0",
    });
    const swTokenBalance = await getTokenBalance(
      ERC20ContractConfig.address,
      smartWalletAddress ?? (await primeSdk?.getCounterFactualAddress()!!)
    );

    const eoaTokenBalance = await getTokenBalance(
      ERC20ContractConfig.address,
      getAddress(address ?? "0x0")
    );

    const tokenBalance: TokenBalance = {
      name: ERC20ContractConfig.name,
      smartWalletBalance: swTokenBalance ?? "0.00",
      eoaBalance: eoaTokenBalance ?? "0.00",
      address: ERC20ContractConfig.address,
    };

    console.log("PDOC", tokenBalance);

    const formattedBalance = BigInt(eoaNativeBalance?.value.toString() ?? "0");

    const nativeBalance: TokenBalance = {
      name: eoaNativeBalance.symbol,
      smartWalletBalance: swNativeBalance ?? "0.00",
      eoaBalance: formatUnits(formattedBalance, 18),
      address: "0x0000000000000000000000000000000000000000",
    };

    console.log("RBTC", nativeBalance);

    setBalances([tokenBalance, nativeBalance]);
  };

  const getTokenBalance = async (
    tokenAddress: string,
    walletAddress: string
  ) => {
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
    <EtherspotSdkContext.Provider
      value={{
        primeSdk,
        swAddress: smartWalletAddress,
        balances,
        getTokensBalances,
      }}
    >
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
