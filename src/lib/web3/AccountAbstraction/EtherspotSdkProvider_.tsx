// import React, { createContext, useContext, useEffect, useState } from "react";
// import { useAccount, useChainId, useWalletClient } from "wagmi";
// import { printOp } from "@etherspot/prime-sdk/dist/sdk/common/OperationUtils";
// // import { PrimeSdk, ArkaPaymaster, EtherspotBundler, EthereumProvider } from "@etherspot/prime-sdk";
// import {
//   ModularSdk,
//   EtherspotBundler,
//   EthereumProvider,
// } from "@etherspot/modular-sdk";
// import { ERC20abi } from "../../../abis/StablecoinConfig";
// import { getAddress, formatUnits } from "viem";
// import { OPSReceipt, TokenBalance } from "../types";
// import { getBalance } from "@wagmi/core";
// import { config } from "../../../wagmi";
// import { BlockchainMapper, PublicClientManager } from "../PublicClientManager"; // Import the manager
// import {
//   getSdkOptionsForChainId,
//   networkNameToFormattedNameMap,
// } from "./EtherspotSdkConfigurations";
// import { ConfigStore } from "../../ConfigStore";

// // Function to map network name to formatted blockchain name
// function mapNetworkNameToFormattedName(
//   networkName: string | undefined
// ): string | null {
//   if (!networkName) {
//     return null;
//   }
//   return networkNameToFormattedNameMap[networkName] || null;
// }

// export const arka_api_key = "etherspot_public_key";
// export const arka_url = "https://arka.etherspot.io";
// export const queryString = `?apiKey=${arka_api_key}&chainId=`;

// interface EtherspotSdkContextType {
//   primeSdk: ModularSdk | null;
//   swAddress: string;
//   balances: TokenBalance[];
//   getTokensBalances: (sdkInstance: ModularSdk) => {};
//   executeTransaction: (
//     operations: { to: string; data: string }[],
//     chainId: number
//   ) => Promise<string | undefined>;
// }

// const EtherspotSdkContext = createContext<EtherspotSdkContextType | undefined>(
//   undefined
// );

// export const EtherspotSdkProvider: React.FC = ({ children }) => {
//   const { address, isConnected, connector } = useAccount();
//   const [primeSdk, setPrimeSdk] = useState<ModularSdk | null>(null);
//   // const [arkaInstance, setArkaInstance] = useState<ArkaPaymaster | null>(null);
//   const [smartWalletAddress, setSwAddress] = useState<string>("");
//   const [balances, setBalances] = useState<TokenBalance[]>([]);
//   const { data: walletClient } = useWalletClient();
//   const account = useAccount();
//   const chainId = useChainId();

//   const createWalletProvider = () => ({
//     ...walletClient,
//     address: account.address ?? "0x0",
//     signMessage: async (message: any) => {
//       return walletClient!!.signMessage({
//         message: { raw: message },
//       });
//     },
//     signTypedData: async (params: any) => {
//       return walletClient!!.signTypedData(params);
//     },
//   });

//   const getEthereumProvider = () => {
//     if (!walletClient) {
//       throw new Error("Wallet client is not available");
//     }

//     // Use the walletClient directly as it should be compatible with ModularSdk
//     return walletClient;
//   };

//   async function whitelistAddressV2(
//     paymasterApiKey: string,
//     chainId: number,
//     address: string
//   ) {
//     const url = new URL(
//       "https://testnet-rpc.etherspot.io/paymaster/whitelist/v2"
//     );
//     url.searchParams.set("apiKey", paymasterApiKey);
//     url.searchParams.set("chainId", chainId.toString());

//     const res = await fetch(url.toString(), {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ params: [address] }),
//     });

//     if (!res.ok) {
//       const error = await res.text();
//       throw new Error(`Whitelist v2 failed: ${error}`);
//     }

//     const data = (await res.json()) as { message: string };
//     console.log(data.message);
//   }

//   /**
//    * Check whether a given address is whitelisted for sponsorship.
//    *
//    * @param paymasterApiKey - Your Arka/Etherspot paymaster API key
//    * @param chainId         - Numeric chain ID (e.g. 1 for mainnet)
//    * @param address         - Hex address to check
//    * @returns               - true if already whitelisted, false if not
//    */
//   async function isWhitelistedV2(
//     paymasterApiKey: string,
//     chainId: number,
//     address: string
//   ): Promise<boolean> {
//     // Build the v2 URL with apiKey + chainId in the query
//     const url = new URL(arka_url);
//     url.searchParams.set("apiKey", paymasterApiKey);
//     url.searchParams.set("chainId", chainId.toString());
//     url.searchParams.set("useVp", "true");

//     // POST body is simply the params array
//     const res = await fetch(url.toString(), {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ params: [address] }),
//     });

//     if (!res.ok) {
//       const errText = await res.text();
//       throw new Error(`Whitelist check failed: ${errText}`);
//     }

//     const json = (await res.json()) as { message: string };
//     // E.g. message === "Already added" when whitelisted
//     return json.message.toLowerCase().includes("already");
//   }

//   // let arkaPaymasterInstance: ArkaPaymaster | null = null;

//   // const getArkaPaymasterInstance = (
//   //   chainId: number,
//   //   arkaApiKey: string,
//   //   arkaUrl: string
//   // ): ArkaPaymaster => {
//   //   if (!arkaPaymasterInstance) {
//   //     arkaPaymasterInstance = new ArkaPaymaster(chainId, arkaApiKey, arkaUrl);
//   //   }
//   //   return arkaPaymasterInstance;
//   // };

//   // Bundler
//   //https://testnet-rpc.etherspot.io/v2/421614?api-key=etherspot_3ZVooGBfUwejKEQFJzmvMxKK

//   // Paymaster
//   //https://rpc.etherspot.io/paymaster/{endpoint-here}?api-key=etherspot_3ZVooGBfUwejKEQFJzmvMxKK

//   //Data Utils
//   //https://rpc.etherspot.io/data-utils/{endpoint-here}?api-key=etherspot_3ZVooGBfUwejKEQFJzmvMxKK

//   useEffect(() => {
//     const handleChainIdChange = async () => {
//       if (primeSdk) {
//         primeSdk.destroy();
//         setPrimeSdk(null);
//       }
//       // if (arkaInstance) {
//       //   setArkaInstance(null);
//       // }
//       if (walletClient && isConnected) {
//         const walletProvider = createWalletProvider();
//         if (!walletProvider.address) {
//           throw new Error("Wallet provider address is undefined");
//         }
//         const primeSdkInstance = new ModularSdk(
//           getEthereumProvider(),
//           getSdkOptionsForChainIdV2(chainId)
//         );
//         if (primeSdkInstance !== null) {
//           const smartWalletAddress =
//             await primeSdkInstance?.getCounterFactualAddress();
//           setSwAddress(smartWalletAddress);
//           setPrimeSdk(primeSdkInstance);
//           getTokensBalances(primeSdkInstance);
//         }
//       }
//     };

//     handleChainIdChange();
//   }, [chainId]);

//   useEffect(() => {
//     const connectToSdk = async () => {
//       if (!walletClient && !isConnected && primeSdk) {
//         primeSdk.destroy();
//         setPrimeSdk(null);
//       }
//       if (walletClient && isConnected && !primeSdk) {
//         const walletProvider = createWalletProvider();
//         if (!walletProvider.address) {
//           throw new Error("Wallet provider address is undefined");
//         }
//         // const primeSdkInstance = new PrimeSdk(
//         //   walletProvider,
//         //   getSdkOptionsForChainId(chainId)
//         // );

//         const modularSdk = new ModularSdk(
//           getEthereumProvider(),
//           getSdkOptionsForChainId(chainId)
//         );

//         if (modularSdk !== null) {
//           const smartWalletAddress =
//             await modularSdk?.getCounterFactualAddress();
//           setSwAddress(smartWalletAddress);
//           setPrimeSdk(modularSdk);
//           getTokensBalances(modularSdk);
//         }
//       } else {
//         console.log("isConnected", isConnected);
//         console.log("primeSdk", primeSdk);
//       }
//     };

//     connectToSdk();
//   }, [walletClient, isConnected]);

//   // Function to fetch balances for stablecoins on a given blockchain
//   async function fetchStablecoinBalances(
//     smartWalletAddress: string,
//     eoaAddress: string,
//     currentBlockchain: string
//   ): Promise<TokenBalance[]> {
//     const tokenBalances: TokenBalance[] = [];

//     try {
//       const blockchainName =
//         currentBlockchain === "ARBITRUM"
//           ? "ARBITRUM_MAINNET"
//           : currentBlockchain;

//       const stablecoinsByBlockchain =
//         ConfigStore.getInstance().getStablecoinsByBlockchain(blockchainName);

//       console.log("stablecoinsByBlockchain", stablecoinsByBlockchain);
//       await Promise.all(
//         stablecoinsByBlockchain.map(async (stablecoin) => {
//           const relevantAddresses = stablecoin.addresses.filter(
//             (address) => address.blockchain === blockchainName
//           );
//           for (const { address } of relevantAddresses) {
//             try {
//               // Determine the correct decimals for this token
//               let decimals = 18; // Default for most tokens

//               // Check for specific tokens with different decimals
//               if (stablecoin.name === "USDC" || stablecoin.name === "USDT") {
//                 decimals = 6; // USDC and USDT use 6 decimals
//               }

//               const [swTokenBalance, eoaTokenBalance] = await Promise.all([
//                 getStablecoinBalance(
//                   address,
//                   smartWalletAddress,
//                   chainId,
//                   decimals
//                 ),
//                 getStablecoinBalance(address, eoaAddress, chainId, decimals),
//               ]);

//               console.log("swTokenBalance", swTokenBalance);
//               console.log("eoaTokenBalance", eoaTokenBalance);

//               // Map the balances to the TokenBalance type
//               tokenBalances.push({
//                 name: stablecoin.name ?? "Unknown",
//                 eoaBalance: eoaTokenBalance ?? "-0.00",
//                 smartWalletBalance: swTokenBalance ?? "-0.00",
//                 address:
//                   address ?? "0x0000000000000000000000000000000000000000",
//               });
//             } catch (balanceError) {
//               console.error(
//                 `Error fetching balance for ${stablecoin.name} at address ${address}:`,
//                 balanceError
//               );
//             }
//           }
//         })
//       );
//     } catch (error) {
//       console.error("Error fetching stablecoin balances:", error);
//     }

//     return tokenBalances;
//   }

//   const getTokensBalances = async (modularSdk?: ModularSdk) => {
//     const smartWalletAddress = await modularSdk?.getCounterFactualAddress();

//     const eoaNativeBalance = await getBalance(config, {
//       address: account.address ?? "0x0000000000000000000000000000000000000000",
//     });

//     const swNativeBalance = await modularSdk?.getNativeBalance();

//     const currentBlockchain =
//       BlockchainMapper.getBlockchainNameByChainId(chainId);

//     const formattedBalance = BigInt(eoaNativeBalance?.value.toString() ?? "0");

//     const nativeBalance: TokenBalance = {
//       name: eoaNativeBalance.symbol,
//       smartWalletBalance: swNativeBalance ?? "0.00",
//       eoaBalance: formatUnits(formattedBalance, 18),
//       address: "0x0000000000000000000000000000000000000000",
//     };

//     const balances = await fetchStablecoinBalances(
//       smartWalletAddress ?? (await primeSdk?.getCounterFactualAddress()!!),
//       account.address!!,
//       currentBlockchain
//     );

//     balances.push(nativeBalance);

//     setBalances(balances);
//   };

//   const getStablecoinBalance = async (
//     tokenAddress: string,
//     walletAddress: string,
//     chainId: number,
//     decimals: number = 18
//   ) => {
//     const client = PublicClientManager.getInstance({ chainId });
//     const balance = await client.readContract({
//       address: getAddress(tokenAddress),
//       abi: ERC20abi,
//       functionName: "balanceOf",
//       args: [walletAddress],
//     });

//     if (balance !== undefined && balance !== null) {
//       const formattedBalance = BigInt(balance.toString());
//       return formatUnits(formattedBalance, decimals);
//     }
//   };

//   // Example of updating transaction status
//   const executeTransaction = async (
//     operations: { to: string; data: string }[],
//     chainId: number
//   ): Promise<string | undefined> => {
//     try {
//       const userOpReceipt = await processBatchOperations(operations, chainId);
//       return userOpReceipt;
//     } catch (error) {
//       console.log("error while executing transaction", error);
//       return Promise.reject(new Error("Transaction failed"));
//     }
//   };

//   const processBatchOperations = async (
//     operations: { to: string; data: string }[],
//     chainId: number
//   ): Promise<string | undefined> => {
//     if (!primeSdk) {
//       throw new Error("PrimeSdk instance is not available.");
//     }
//     await primeSdk.clearUserOpsFromBatch();
//     for (const operation of operations) {
//       await primeSdk.addUserOpsToBatch(operation);
//     }
//     // Updated paymaster URL construction
//     const paymasterUrl =
//       "https://rpc.etherspot.io/paymaster/api-key=etherspot_3ZVooGBfUwejKEQFJzmvMxKK&chainId=" +
//       chainId +
//       "&useVp=true";
//     // https://rpc.etherspot.io/paymaster/{endpoint-here}?api-key=etherspot_3ZVooGBfUwejKEQFJzmvMxKK

//     // "https://rpc.etherspot.io/paymaster?apiKey=etherspot_3ZVooGBfUwejKEQFJzmvMxKK&chainId=" +
//     // chainId +
//     // "&useVp=true";
//     // "https://arka.etherspot.io?apiKey=etherspot_3ZVooGBfUwejKEQFJzmvMxKK&chainId=" +
//     // chainId;
//     //`https://paymaster.etherspot.io?apiKey=etherspot_3ZVooGBfUwejKEQFJzmvMxKK&chainId=${chainId}`;
//     // "https://arka.etherspot.io?apiKey=etherspot_3ZVooGBfUwejKEQFJzmvMxKK&chainId=" +
//     /*
//     export interface SdkOptions {
//     chainId: number;
//     bundlerProvider?: BundlerProviderLike;
//     rpcProviderUrl?: string;
//     factoryWallet?: Factory;
//     walletFactoryAddress?: string;
//     entryPointAddress?: string;
//     accountAddress?: string;
//     index?: number;
// }
//     */
//     const op = await primeSdk.estimate({
//       paymasterDetails: {
//         url: paymasterUrl,
//         context: {
//           mode: "sponsor",
//         },
//       },
//     });
//     console.log("Estimate UserOp: ", await printOp(op));
//     try {
//       return await primeSdk.send(op);
//     } catch (error) {
//       console.error("Error sending UserOp:", error);
//       return undefined;
//     }
//   };

//   const whitelistPaymaster = async (address: string): Promise<boolean> => {
//     const isWhitelisted = await isWhitelistedV2(
//       "etherspot_3ZVooGBfUwejKEQFJzmvMxKK",
//       chainId,
//       address
//     );
//     if (!isWhitelisted) {
//       console.log("whitelisting...");
//       try {
//         const response = await whitelistAddressV2(
//           "etherspot_3ZVooGBfUwejKEQFJzmvMxKK",
//           chainId,
//           address
//         );
//         console.log("Got whitelisting response", response);
//         return true;
//       } catch (error) {
//         console.log(error);
//         return false;
//       }
//     }
//     return false;
//   };

//   return (
//     <EtherspotSdkContext.Provider
//       value={{
//         primeSdk,
//         swAddress: smartWalletAddress,
//         balances,
//         getTokensBalances,
//         executeTransaction,
//       }}
//     >
//       {children}
//     </EtherspotSdkContext.Provider>
//   );
// };

// export const useEtherspotSdk = () => {
//   const context = useContext(EtherspotSdkContext);
//   if (context === undefined) {
//     throw new Error(
//       "useEtherspotSdk must be used within an EtherspotSdkProvider"
//     );
//   }
//   return context;
// };
