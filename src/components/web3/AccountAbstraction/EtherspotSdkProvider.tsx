import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { printOp } from "@etherspot/prime-sdk/dist/sdk/common/OperationUtils";
import { PrimeSdk, ArkaPaymaster } from "@etherspot/prime-sdk";
import { ERC20abi } from "@/components/web3/abis/StablecoinConfig";
import { getAddress, formatUnits, parseGwei, parseUnits } from "viem";
import { TokenBalance } from "@/components/web3/types";
import { getBalance } from "@wagmi/core";
import { config } from "@/components/web3/wagmi";
import { PublicClientManager } from "@/components/web3/Web3RPCClientManager"; // Import the manager
import {
  getSdkOptionsForChainId,
  networkNameToFormattedNameMap,
} from "./EtherspotSdkConfigurations";
import { ConfigStore } from "@/lib/ConfigStore";
import { TransactionGasInfoForUserOp } from "@etherspot/prime-sdk/dist/sdk/base/TransactionDetailsForUserOp";

// Function to map network name to formatted blockchain name
function mapNetworkNameToFormattedName(
  networkName: string | undefined
): string | null {
  if (!networkName) {
    return null;
  }
  return networkNameToFormattedNameMap[networkName] || null;
}
//etherspot_public_key
export const arka_api_key = "etherspot_3ZVooGBfUwejKEQFJzmvMxKK";
export const arka_url = "https://arka.etherspot.io";
export const queryString = `?apiKey=${arka_api_key}&chainId=`;

interface EtherspotSdkContextType {
  primeSdk: PrimeSdk | null;
  swAddress: string;
  balances: TokenBalance[];
  getTokensBalances: (sdkInstance: PrimeSdk) => {};
  executeTransaction: (
    operations: { to: string; data: string }[],
    chainId: number
  ) => Promise<string | undefined>;
}

const EtherspotSdkContext = createContext<EtherspotSdkContextType | undefined>(
  undefined
);

export const EtherspotSdkProvider: React.FC = ({ children }) => {
  const { address, isConnected } = useAccount();
  const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
  const [arkaInstance, setArkaInstance] = useState<ArkaPaymaster | null>(null);
  const [smartWalletAddress, setSwAddress] = useState<string>("");
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const { data: walletClient } = useWalletClient();
  const account = useAccount();
  const chainId = useChainId();

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

  let arkaPaymasterInstance: ArkaPaymaster | null = null;

  const getArkaPaymasterInstance = (
    chainId: number,
    arkaApiKey: string,
    arkaUrl: string
  ): ArkaPaymaster => {
    if (!arkaPaymasterInstance) {
      arkaPaymasterInstance = new ArkaPaymaster(
        chainId,
        arkaApiKey + "&useVp=true",
        arkaUrl
      );
    }
    return arkaPaymasterInstance;
  };

  useEffect(() => {
    const handleChainIdChange = async () => {
      if (primeSdk) {
        primeSdk.destroy();
        setPrimeSdk(null);
      }
      if (arkaInstance) {
        setArkaInstance(null);
      }
      if (walletClient && isConnected) {
        const walletProvider = createWalletProvider();
        if (!walletProvider.address) {
          throw new Error("Wallet provider address is undefined");
        }
        const primeSdkInstance = new PrimeSdk(
          walletProvider,
          getSdkOptionsForChainId(chainId)
        );
        if (primeSdkInstance !== null) {
          const smartWalletAddress =
            await primeSdkInstance?.getCounterFactualAddress();
          const arkaInstance = getArkaPaymasterInstance(
            chainId,
            arka_api_key,
            arka_url
          );
          setSwAddress(smartWalletAddress);
          setPrimeSdk(primeSdkInstance);
          setArkaInstance(arkaInstance);
          getTokensBalances(primeSdkInstance);
        }
      }
    };

    handleChainIdChange();
  }, [chainId]);

  useEffect(() => {
    const connectToSdk = async () => {
      if (!walletClient && !isConnected && primeSdk) {
        primeSdk.destroy();
        setPrimeSdk(null);
      }
      if (walletClient && isConnected && !primeSdk) {
        const walletProvider = createWalletProvider();
        if (!walletProvider.address) {
          throw new Error("Wallet provider address is undefined");
        }
        const primeSdkInstance = new PrimeSdk(
          walletProvider,
          getSdkOptionsForChainId(chainId)
        );
        if (primeSdkInstance !== null) {
          const smartWalletAddress =
            await primeSdkInstance?.getCounterFactualAddress();
          const arkaInstance = getArkaPaymasterInstance(
            chainId,
            arka_api_key,
            arka_url
          );
          setSwAddress(smartWalletAddress);
          setPrimeSdk(primeSdkInstance);
          setArkaInstance(arkaInstance);
          getTokensBalances(primeSdkInstance);
        }
      } else {
        console.log("isConnected", isConnected);
        console.log("primeSdk", primeSdk);
      }
    };

    connectToSdk();
  }, [walletClient, isConnected]);

  // Function to fetch balances for stablecoins on a given blockchain
  async function fetchStablecoinBalances(
    smartWalletAddress: string,
    eoaAddress: string,
    currentBlockchain: string
  ): Promise<TokenBalance[]> {
    const tokenBalances: TokenBalance[] = [];

    try {
      const stablecoinsByBlockchain =
        ConfigStore.getInstance().getStablecoinsByBlockchain(currentBlockchain);
      // Use Promise.all to fetch balances concurrently for better performance
      await Promise.all(
        stablecoinsByBlockchain.map(async (stablecoin) => {
          const relevantAddresses = stablecoin.addresses.filter(
            (address) => address.blockchain === currentBlockchain
          );
          for (const { address } of relevantAddresses) {
            try {
              const [swTokenBalance, eoaTokenBalance] = await Promise.all([
                getStablecoinBalance(address, smartWalletAddress, chainId),
                getStablecoinBalance(address, eoaAddress, chainId),
              ]);

              // Map the balances to the TokenBalance type
              tokenBalances.push({
                name: stablecoin.name ?? "Unknown",
                eoaBalance: eoaTokenBalance ?? "-0.00",
                smartWalletBalance: swTokenBalance ?? "-0.00",
                address:
                  address ?? "0x0000000000000000000000000000000000000000",
              });
            } catch (balanceError) {
              console.error(
                `Error fetching balance for ${stablecoin.name} at address ${address}:`,
                balanceError
              );
            }
          }
        })
      );
    } catch (error) {
      console.error("Error fetching stablecoin balances:", error);
    }

    return tokenBalances;
  }

  const getTokensBalances = async (primeSdk?: PrimeSdk) => {
    const smartWalletAddress = await primeSdk?.getCounterFactualAddress();

    const eoaNativeBalance = await getBalance(config, {
      address: account.address ?? "0x0000000000000000000000000000000000000000",
    });

    const swNativeBalance = await primeSdk?.getNativeBalance();

    const currentBlockchain = mapNetworkNameToFormattedName(
      primeSdk?.state.network.name
    )!!;

    const formattedBalance = BigInt(eoaNativeBalance?.value.toString() ?? "0");

    const nativeBalance: TokenBalance = {
      name: eoaNativeBalance.symbol,
      smartWalletBalance: swNativeBalance ?? "0.00",
      eoaBalance: formatUnits(formattedBalance, 18),
      address: "0x0000000000000000000000000000000000000000",
    };

    const balances = await fetchStablecoinBalances(
      smartWalletAddress ?? (await primeSdk?.getCounterFactualAddress()!!),
      account.address!!,
      currentBlockchain
    );

    balances.push(nativeBalance);

    setBalances(balances);
  };

  const getStablecoinBalance = async (
    tokenAddress: string,
    walletAddress: string,
    chainId: number
  ) => {
    const client = PublicClientManager.getInstance({ chainId });
    const balance = await client.readContract({
      address: getAddress(tokenAddress),
      abi: ERC20abi,
      functionName: "balanceOf",
      args: [walletAddress],
    });

    if (balance !== undefined && balance !== null) {
      const formattedBalance = BigInt(balance.toString());
      const decimals = ConfigStore.getInstance().getTokenDecimals(tokenAddress);
      return formatUnits(formattedBalance, decimals);
    }
  };

  // Example of updating transaction status
  const executeTransaction = async (
    operations: { to: string; data: string }[],
    chainId: number
  ): Promise<string | undefined> => {
    try {
      const userOpReceipt = await processBatchOperations(operations, chainId);
      return userOpReceipt;
    } catch (error) {
      console.log("error while executing transaction", error);
      return Promise.reject(new Error("Transaction failed"));
    }
  };

  const processBatchOperations = async (
    operations: { to: string; data: string }[],
    chainId: number
  ): Promise<string | undefined> => {
    if (!primeSdk) {
      throw new Error("PrimeSdk instance is not available.");
    }
    await primeSdk.clearUserOpsFromBatch();
    for (const operation of operations) {
      await primeSdk.addUserOpsToBatch(operation);
    }
    await whitelistPaymaster(smartWalletAddress);

    // 4. Get current network state
    const client = PublicClientManager.getInstance({ chainId });
    const block = await client.getBlock({ blockTag: "latest" });
    const baseFee = block?.baseFeePerGas ?? BigInt(0);

    // 5. Get network-specific gas settings with dynamic adjustment
    const currentBlockchain = mapNetworkNameToFormattedName(
      primeSdk?.state.network.name
    )!!;
    let maxPriorityFeePerGasGwei =
      ConfigStore.getInstance().getMaxPriorityFeePerGasGwei(currentBlockchain);

    // // 6. Dynamic gas price adjustment based on network conditions
    // const gasFee = await primeSdk.getGasFee();
    // if (gasFee && gasFee.maxPriorityFeePerGas) {
    //   // Use the higher of our config value or the SDK's suggestion
    //   const suggestedPriorityFee = Number(
    //     formatUnits(BigInt(gasFee.maxPriorityFeePerGas.toString()), "gwei")
    //   );
    //   maxPriorityFeePerGasGwei = Math.max(
    //     Number(maxPriorityFeePerGasGwei),
    //     suggestedPriorityFee
    //   );
    // }

    const maxPriorityFeePerGas = parseGwei(maxPriorityFeePerGasGwei.toString());
    const maxFeePerGas = baseFee + maxPriorityFeePerGas * BigInt(2); // Double for safety

    // 7. Estimate with enhanced gas parameters
    // const estimatedOp = await primeSdk.estimate({
    //   paymasterDetails: {
    //     url: `https://arka.etherspot.io?useVp=true&apiKey=${arka_api_key}&chainId=${chainId}`,
    //     context: { mode: "sponsor" },
    //   },
    //   gasDetails: {
    //     maxFeePerGas,
    //     maxPriorityFeePerGas,
    //   },
    // });
    // const client = PublicClientManager.getInstance({ chainId });
    // const block = await client.getBlock({ blockTag: "latest" });
    // const baseFee = block?.baseFeePerGas ?? BigInt(0);
    // console.log("baseFee", baseFee);

    // // Get the current blockchain name and its maxPriorityFeePerGasGwei
    // const currentBlockchain = mapNetworkNameToFormattedName(
    //   primeSdk?.state.network.name
    // )!!;
    // const maxPriorityFeePerGasGwei =
    //   ConfigStore.getInstance().getMaxPriorityFeePerGasGwei(currentBlockchain);
    // const maxPriorityFeePerGas = parseGwei(maxPriorityFeePerGasGwei.toString());
    // console.log("maxPriorityFeePerGas", maxPriorityFeePerGas);
    // const maxFeePerGas = baseFee + maxPriorityFeePerGas;
    const gasDetails: TransactionGasInfoForUserOp = {
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    };
    console.log("gasDetails", gasDetails);
    const op = await primeSdk.estimate({
      paymasterDetails: {
        url:
          "https://arka.etherspot.io?useVp=true&apiKey=" +
          arka_api_key +
          "&chainId=" +
          chainId,
        context: { mode: "sponsor" },
      },
      gasDetails: gasDetails,
    });
    console.log("Estimate UserOp: ", await printOp(op));
    try {
      return await primeSdk.send(op);
    } catch (error) {
      console.error("Error sending UserOp:", error);
      return undefined;
    }
  };

  const whitelistPaymaster = async (address: string): Promise<boolean> => {
    if (!arkaInstance) {
      throw new Error("Arka instance is not initialized.");
    }
    const isWhitelisted = await arkaInstance.checkWhitelist(address);
    if (isWhitelisted !== "Already added") {
      console.log("whitelisting...");
      try {
        const response = await arkaInstance.addWhitelist([address]);
        console.log("Got whitelisting response", response);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
    return false;
  };

  return (
    <EtherspotSdkContext.Provider
      value={{
        primeSdk,
        swAddress: smartWalletAddress,
        balances,
        getTokensBalances,
        executeTransaction,
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
