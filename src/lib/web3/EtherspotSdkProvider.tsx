import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { printOp } from "@etherspot/prime-sdk/dist/sdk/common/OperationUtils";
import { PrimeSdk, ArkaPaymaster } from "@etherspot/prime-sdk";
import {
  getStablecoinsByBlockchain,
  ERC20abi,
} from "../../abis/StablecoinConfig";
import { getAddress, formatUnits } from "viem";
import { OPSReceipt, TokenBalance } from "./types";
import { getBalance } from "@wagmi/core";
import { config } from "../../wagmi";
import { PublicClientManager } from "./PublicClientManager"; // Import the manager
import {
  getSdkOptionsForChainId,
  networkNameToFormattedNameMap,
} from "./EtherspotSdkConfigurations";
import { sleep } from "@etherspot/prime-sdk/dist/sdk/common";

// Function to map network name to formatted blockchain name
function mapNetworkNameToFormattedName(
  networkName: string | undefined
): string | null {
  if (!networkName) {
    return null;
  }
  return networkNameToFormattedNameMap[networkName] || null;
}

export const arka_api_key = "etherspot_public_key";
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
  ) => Promise<OPSReceipt>;
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
      arkaPaymasterInstance = new ArkaPaymaster(chainId, arkaApiKey, arkaUrl);
    }
    return arkaPaymasterInstance;
  };

  // Bundler
  //https://testnet-rpc.etherspot.io/v2/421614?api-key=etherspot_3ZVooGBfUwejKEQFJzmvMxKK

  // Paymaster
  //https://rpc.etherspot.io/paymaster/{endpoint-here}?api-key=etherspot_3ZVooGBfUwejKEQFJzmvMxKK

  //Data Utils
  //https://rpc.etherspot.io/data-utils/{endpoint-here}?api-key=etherspot_3ZVooGBfUwejKEQFJzmvMxKK

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
        const primeSdkInstance = new PrimeSdk(
          walletProvider,
          getSdkOptionsForChainId(chainId)
        );
        if (primeSdkInstance !== null) {
          console.log("Prime SDK initialized:", primeSdkInstance);
          const smartWalletAddress =
            await primeSdkInstance?.getCounterFactualAddress();
          const arkaInstance = getArkaPaymasterInstance(
            chainId,
            arka_api_key,
            arka_url
          );
          console.log("arI", arkaInstance);
          setSwAddress(smartWalletAddress);
          setPrimeSdk(primeSdkInstance);
          getTokensBalances(primeSdkInstance);
          setArkaInstance(arkaInstance);
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
        getStablecoinsByBlockchain(currentBlockchain);

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
      address: address ?? "0x0",
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
      getAddress(address ?? "0x0"),
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
      return formatUnits(formattedBalance, 18);
    }
  };

  // Example of updating transaction status
  const executeTransaction = async (
    operations: { to: string; data: string }[],
    chainId: number
  ): Promise<OPSReceipt> => {
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
  ): Promise<OPSReceipt> => {
    if (!primeSdk) {
      throw new Error("PrimeSdk instance is not available.");
    }
    await primeSdk.clearUserOpsFromBatch();
    for (const operation of operations) {
      await primeSdk.addUserOpsToBatch(operation);
    }
    await whitelistPaymaster(smartWalletAddress);
    const op = await primeSdk.estimate({
      paymasterDetails: {
        url:
          "https://arka.etherspot.io?apiKey=etherspot_public_key&chainId=" +
          chainId,
        context: { mode: "sponsor" },
      },
    });
    console.log("Estimate UserOp: ", await printOp(op));
    // Sign the UserOp and send it to the bundler
    const uoHash = await primeSdk.send(op);
    // Wait for the transaction receipt
    let userOpsReceipt = null;
    const timeout = Date.now() + 300000; // 5 minute timeout
    while (userOpsReceipt == null && Date.now() < timeout) {
      await sleep(5);
      userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
    }
    return userOpsReceipt;
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
