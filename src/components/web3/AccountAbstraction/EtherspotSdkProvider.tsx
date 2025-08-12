import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import {
  PrimeSdk,
  ArkaPaymaster,
  Web3WalletProvider,
} from "@etherspot/prime-sdk";
import { TokenBalance } from "@/components/web3/types";
import { useWeb3Auth, useWeb3AuthDisconnect } from "@web3auth/modal/react";
import { getArkaPaymasterService } from "./ArkaPaymasterService";
import { EtherspotSdksManager } from "./EtherspotSdksManager";

interface EtherspotSdkContextType {
  primeSdk: PrimeSdk | null;
  swAddress: string;
  eoaAddress: string;
  balances: TokenBalance[];
  refreshBalances: () => Promise<void>;
}

const EtherspotSdkContext = createContext<EtherspotSdkContextType | undefined>(
  undefined
);

export const EtherspotSdkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { address, isConnected } = useAccount();
  // const { isConnected: isConnectedWeb3Auth } = useWeb3AuthConnect();
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
  const [arkaInstance, setArkaInstance] = useState<ArkaPaymaster | null>(null);
  const [smartWalletAddress, setSwAddress] = useState<string>("");
  const [eoaAddress, setEoaAddress] = useState<string>("");
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const { data: walletClient } = useWalletClient();
  const account = useAccount();
  const chainId = useChainId();
  const {
    web3Auth,
    isConnected: isConnectedWeb3Auth,
    provider,
    status,
  } = useWeb3Auth();

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

  const createWeb3AuthWalletProvider = async (web3authProvider: any) => {
    if (!web3authProvider) throw new Error("Web3Auth provider not initialized");
    // Use the Etherspot wrapper
    // return new Web3WalletProvider(web3authProvider);
    return await Web3WalletProvider.connect(web3authProvider);
  };

  const refreshBalances = async () => {
    if (primeSdk && eoaAddress) {
      const updatedBalances =
        await EtherspotSdksManager.getInstance().getTokensBalances(
          primeSdk,
          eoaAddress
        );
      setBalances(updatedBalances ?? []);
    }
  };

  useEffect(() => {
    const connectToSdk = async () => {
      if (!isConnectedWeb3Auth && primeSdk) {
        primeSdk.destroy();
        setPrimeSdk(null);
      }
      if (isConnectedWeb3Auth && !primeSdk) {
        console.log("isConnectedWeb3Auth", isConnectedWeb3Auth);
        console.log("web3Auth", web3Auth);
        console.log("provider", provider);
        console.log("status", status);
        const walletProvider = await createWeb3AuthWalletProvider(provider);
        if (!walletProvider.address) {
          throw new Error("Wallet provider address is undefined");
        }
        const primeSdkInstance =
          await EtherspotSdksManager.getInstance().createPrimeSdk(
            walletProvider,
            chainId
          );
        if (primeSdkInstance !== null) {
          const smartWalletAddress =
            await primeSdkInstance?.getCounterFactualAddress();
          const arkaInstance = getArkaPaymasterService(chainId);
          setEoaAddress(walletProvider.address);
          setSwAddress(smartWalletAddress);
          setPrimeSdk(primeSdkInstance);
          setArkaInstance(arkaInstance);
          const balances =
            await EtherspotSdksManager.getInstance().getTokensBalances(
              primeSdkInstance,
              walletProvider.address
            );
          setBalances(balances ?? []);
        }
      } else {
        console.log("isConnected", isConnected);
        console.log("primeSdk", primeSdk);
      }
    };

    connectToSdk();
  }, [isConnectedWeb3Auth, chainId]);

  return (
    <EtherspotSdkContext.Provider
      value={{
        primeSdk,
        swAddress: smartWalletAddress,
        eoaAddress: eoaAddress,
        balances,
        refreshBalances,
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
