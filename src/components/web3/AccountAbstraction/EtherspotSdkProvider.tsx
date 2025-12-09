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
  switchToChain: (chainId: number) => Promise<void>;
  currentChainId: number;
  // True while we are initializing SDK and fetching initial balances
  isLoading: boolean;
  // True after the first successful initialization + balances fetch
  isReady: boolean;
}

const EtherspotSdkContext = createContext<EtherspotSdkContextType | undefined>(
  undefined
);

export const EtherspotSdkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
  const [primeSdkMap, setPrimeSdkMap] = useState<Map<number, PrimeSdk>>(
    new Map()
  );
  const [arkaInstance, setArkaInstance] = useState<ArkaPaymaster | null>(null);
  const [smartWalletAddress, setSwAddress] = useState<string>("");
  const [eoaAddress, setEoaAddress] = useState<string>("");
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [currentChainId, setCurrentChainId] = useState<number>(0);
  const chainId = useChainId();
  const { isConnected: isConnectedWeb3Auth, provider } = useWeb3Auth();

  const createWeb3AuthWalletProvider = async (web3authProvider: any) => {
    if (!web3authProvider) throw new Error("Web3Auth provider not initialized");
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

  const switchToChain = async (targetChainId: number) => {
    if (!eoaAddress || !isConnectedWeb3Auth) {
      console.warn("Cannot switch chain: not connected");
      return;
    }

    setIsLoading(true);

    try {
      // Check if we already have a PrimeSdk for this chain
      let targetPrimeSdk = primeSdkMap.get(targetChainId);

      // If not, create one
      if (!targetPrimeSdk) {
        const walletProvider = await createWeb3AuthWalletProvider(provider);
        const newPrimeSdk =
          await EtherspotSdksManager.getInstance().createPrimeSdk(
            walletProvider,
            targetChainId
          );

        if (newPrimeSdk) {
          targetPrimeSdk = newPrimeSdk;
          // Store it in the map
          setPrimeSdkMap((prev) =>
            new Map(prev).set(targetChainId, newPrimeSdk)
          );
        }
      }

      if (targetPrimeSdk) {
        // Switch to the target SDK
        setPrimeSdk(targetPrimeSdk);
        setCurrentChainId(targetChainId);

        // Update smart wallet address for this chain
        const smartWalletAddress =
          await targetPrimeSdk.getCounterFactualAddress();
        setSwAddress(smartWalletAddress);

        // Fetch balances for this chain
        const balances =
          await EtherspotSdksManager.getInstance().getTokensBalances(
            targetPrimeSdk,
            eoaAddress
          );
        setBalances(balances ?? []);
      }
    } catch (error) {
      console.error(`Error switching to chain ${targetChainId}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const connectToSdk = async () => {
      // Handle disconnect
      if (!isConnectedWeb3Auth) {
        // Destroy all SDK instances
        primeSdkMap.forEach((sdk) => {
          try {
            sdk.destroy();
          } catch (e) {
            console.error("Error destroying SDK:", e);
          }
        });
        setPrimeSdkMap(new Map());
        setPrimeSdk(null);
        setSwAddress("");
        setEoaAddress("");
        setBalances([]);
        setIsLoading(false);
        setIsReady(false);
        setCurrentChainId(0);
        return;
      }

      // Initialize on first connect
      if (isConnectedWeb3Auth && !primeSdk) {
        setIsLoading(true);
        setIsReady(false);
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
          setCurrentChainId(chainId);
          // Store the initial SDK in the map
          setPrimeSdkMap(new Map().set(chainId, primeSdkInstance));
          setArkaInstance(arkaInstance);
          const balances =
            await EtherspotSdksManager.getInstance().getTokensBalances(
              primeSdkInstance,
              walletProvider.address
            );
          setBalances(balances ?? []);
          setIsLoading(false);
          setIsReady(true);
        } else {
          setIsLoading(false);
          setIsReady(false);
        }
      }
    };

    connectToSdk();
  }, [isConnectedWeb3Auth, chainId, provider]);

  return (
    <EtherspotSdkContext.Provider
      value={{
        primeSdk,
        swAddress: smartWalletAddress,
        eoaAddress: eoaAddress,
        balances,
        refreshBalances,
        switchToChain,
        currentChainId,
        isLoading,
        isReady,
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
