import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import {
  createPublicClient,
  http,
  getAddress,
  encodeFunctionData,
  formatUnits,
  parseUnits,
} from "viem";
import { EtherspotBundler, PrimeSdk, SdkOptions } from "@etherspot/prime-sdk";
import { rootstockTestnet } from "wagmi/chains";
import { ERC20ContractConfig } from "../abis/ERC20ContractConfig";
import { RSKEscrowContractConfig } from "@/abis/RSKEscrowConfig";
import { sleep } from "@etherspot/prime-sdk/dist/sdk/common";
import { printOp } from "@etherspot/prime-sdk/dist/sdk/common/OperationUtils";
import { createHash, randomBytes } from "crypto";
import { Order } from "b5-api-client";
import { useEtherspotSdk } from "@/lib/web3/EtherspotSdkProvider";
import { ArkaPaymaster } from "@etherspot/prime-sdk";

const publicClient = createPublicClient({
  chain: rootstockTestnet,
  transport: http(),
});

// interface Stablecoin {
//   name: string;
//   eoaBalance: string;
//   smartWalletBalance: string;
// }

export const useEtherspotFlow = () => {
  const { address, isConnected } = useAccount();
  // const [primeSdk, setPrimeSdk] = useState<PrimeSdk | null>(null);
  // const [swAddress, setSwAddress] = useState<string>("");
  // const [stablecoin, setStablecoin] = useState<Stablecoin | null>(null);
  const { data: walletClient } = useWalletClient();
  const account = useAccount();
  const { primeSdk, swAddress, balances: stablecoin } = useEtherspotSdk();

  // const createSmartContractWallet = async () => {
  //   if (walletClient && isConnected && !primeSdk) {
  //     const options: SdkOptions = {
  //       chainId: 31, // Rootstock Testnet chain ID
  //       rpcProviderUrl: "https://public-node.testnet.rsk.co", // Rootstock Testnet RPC URL
  //       bundlerProvider: new EtherspotBundler(
  //         31,
  //         "eyJvcmciOiI2NTIzZjY5MzUwOTBmNzAwMDFiYjJkZWIiLCJpZCI6ImE3MDA0NWM5Y2IyNTQ3ODA5ZTgwOTVjNzUwYjAyYzM1IiwiaCI6Im11cm11cjEyOCJ9",
  //         "https://rootstocktestnet-bundler.etherspot.io/",
  //       ),
  //     };
  //     const walletProvider = {
  //       ...walletClient,
  //       address: address ?? "0x0000000000000000000000000000000000000000",
  //       signMessage: async (message: string) => {
  //         console.log(account.address);
  //         return walletClient.signMessage({
  //           message: { raw: message },
  //         });
  //       },
  //       signTypedData: async (params: any) => {
  //         // Implement the signTypedData method as needed
  //         return walletClient.signTypedData(params);
  //       },
  //     };
  //     const primeSdkInstance = new PrimeSdk(walletProvider, options);
  //     if (primeSdkInstance !== null) {
  //       console.log("Prime SDK initialized:", primeSdkInstance);
  //       const balance = await primeSdkInstance?.getNativeBalance();
  //       console.log("Prime SDK RBTC:", balance);
  //       const smartWalletAddress =
  //         await primeSdkInstance?.getCounterFactualAddress();
  //       console.log("Etherspot account Address:", smartWalletAddress);
  //       setSwAddress(smartWalletAddress);
  //       const smartWalletBalance = await getBalance(
  //         ERC20ContractConfig.address,
  //         smartWalletAddress,
  //       );

  //       const eoaBalance = await getBalance(
  //         ERC20ContractConfig.address,
  //         getAddress(address!),
  //       );

  //       const balances = {
  //         eoaBalance: eoaBalance ? eoaBalance : "",
  //         smartWalletBalance: smartWalletBalance ? smartWalletBalance : "",
  //         name: ERC20ContractConfig.name,
  //       };

  //       setStablecoin(balances);
  //       // primeSdkInstance.signMessage()
  //       setPrimeSdk(primeSdkInstance);
  //       return balances;
  //     }
  //   }
  // };

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

  const transferTokensToEtherspotWallet = async (
    tokenAddress: string,
    amount: string
  ) => {
    if (walletClient && address && primeSdk) {
      const etherspotAddress = await primeSdk.getCounterFactualAddress();
      const data = encodeFunctionData({
        abi: ERC20ContractConfig.abi,
        functionName: "transfer",
        args: [etherspotAddress, parseUnits(amount, 18)],
      });

      // Send the transaction
      const transferTx = await walletClient.sendTransaction({
        to: getAddress(tokenAddress),
        data: data,
      });

      console.log("Transaction hash:", transferTx);
      return transferTx;
    }
  };

  const transferTokensFromEtherspotToEOA = async (
    tokenAddress: string,
    amount: string,
  ) => {
    if (address && primeSdk) {
      const data = encodeFunctionData({
        abi: ERC20ContractConfig.abi,
        functionName: "transfer",
        args: [address, parseUnits(amount, 18)],
      });

      await primeSdk.clearUserOpsFromBatch();

      // add transactions to the batch
      const userOpsBatch = await primeSdk.addUserOpsToBatch({
        to: tokenAddress,
        data: data,
      });
      console.log("transactions: ", userOpsBatch);

      // estimate transactions added to the batch and get the fee data for the UserOp
      const op = await primeSdk.estimate();
      console.log(`Estimate UserOp: ${await printOp(op)}`);

      // sign the UserOp and sending to the bundler...
      const uoHash = await primeSdk.send(op);
      console.log(`UserOpHash: ${uoHash}`);

      // get transaction hash...
      console.log("Waiting for transaction...");
      let userOpsReceipt = null;
      const timeout = Date.now() + 12000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await sleep(2);
        userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
      }
      console.log("\x1b[33m%s\x1b[0m", `Transaction Receipt: `, userOpsReceipt);
    }
  };

  const lockFunds = async (order: Order) => {
    if (primeSdk) {
      const amountInt = parseUnits(order.amount ?? "0", 18); // Ensure order.amount is not undefined
      const feeInt = amountInt / BigInt(100); // Calculate the fee as a BigInt
      const totalAmount = amountInt + feeInt; // Sum is also a BigInt
      const approveHash = await approveTokenSpending(
        ERC20ContractConfig.address,
        totalAmount,
      );
      console.log("Approve hash", approveHash);
      // Encode the escrowERC20 function call
      const buyerSecret = randomBytes(32);
      const sellerSecret = randomBytes(32);

      // Create a SHA256 hash of the secrets and ensure it's a 32-byte Buffer
      const buyerHashBuffer = createHash("sha256").update(Uint8Array.from(buyerSecret)).digest();
      const sellerHashBuffer = createHash("sha256").update(Uint8Array.from(sellerSecret)).digest();

      // Convert the Buffer to a '0x' prefixed hex string
      const buyerHashBytes32 = "0x" + buyerHashBuffer.toString("hex");
      const sellerHashBytes32 = "0x" + sellerHashBuffer.toString("hex");
      console.log(RSKEscrowContractConfig.address);

      const params = [
        order.id,
        ERC20ContractConfig.address.toLocaleLowerCase(),
        order.buyerAddress,
        buyerHashBytes32,
        sellerHashBytes32,
        amountInt,
        feeInt
      ]
      console.log("PARAMS", params)

      const transactionData = encodeFunctionData({
        abi: RSKEscrowContractConfig.abi,
        functionName: "escrowERC20",
        args: params,
      });

      // Clear the transaction batch
      await primeSdk.clearUserOpsFromBatch();

      // Add transactions to the batch
      const userOpsBatch = await primeSdk.addUserOpsToBatch({
        to: RSKEscrowContractConfig.address.toLowerCase(),
        data: transactionData,
      });
      console.log("Transactions: ", userOpsBatch);
      // Estimate transactions added to the batch and get the fee data for the UserOp
      const op = await primeSdk.estimate();
      console.log("Estimate UserOp: ", await printOp(op));
      // Sign the UserOp and send it to the bundler
      const uoHash = await primeSdk.send(op);
      console.log("UserOpHash: ", uoHash);
      const receipt = await primeSdk.getUserOpReceipt(uoHash);
      console.log("First receipt: ", receipt);
      // Get transaction receipt
      console.log("Waiting for transaction...");
      let userOpsReceipt = null;
      const timeout = Date.now() + 300000; // 1 minute timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        console.log(userOpsReceipt == null);
        console.log(new Date(timeout).toLocaleString());
        console.log(new Date().toLocaleString());
        await sleep(5);
        userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
        console.log(userOpsReceipt);
      }
      console.log("RECEIPT");
      console.log(userOpsReceipt);
      console.log("Transaction Receipt: ", userOpsReceipt);
    }
  };

  // Function to approve ERC20 token spending using primeSdk instance
  const approveTokenSpending = async (
    tokenAddress: string,
    amount: bigint,
  ) => {
    if (primeSdk && address) {
      // Encode the transaction data for the approve function call
      const data = encodeFunctionData({
        abi: ERC20ContractConfig.abi,
        functionName: "approve",
        args: [
          RSKEscrowContractConfig.address.toLowerCase(),
          amount,
        ],
      });

      // Clear any existing operations
      await primeSdk.clearUserOpsFromBatch();

      // Add the approve operation to the batch
      await primeSdk.addUserOpsToBatch({
        to: tokenAddress,
        data: data,
      });

      // Estimate the operation to get the fee data
      const op = await primeSdk.estimate();
      console.log(`Estimate UserOp: ${await printOp(op)}`);

      // Send the operation to the bundler
      const uoHash = await primeSdk.send(op);
      console.log(`UserOpHash: ${uoHash}`);

      // Wait for the transaction receipt
      let userOpsReceipt = null;
      while (userOpsReceipt == null) {
        await sleep(2); // Sleep for a short while before checking again
        userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
      }

      return userOpsReceipt;
    } else {
      throw new Error("PrimeSdk instance or user address is not available.");
    }
  };

  const batchApproveAndEscrow = async (order: Order) => {
    if (primeSdk && address) {
      const amountInt = parseUnits(order.amount ?? "0", 18); // Ensure order.amount is not undefined
      const feeInt = amountInt / BigInt(100); // Calculate the fee as a BigInt
      const totalAmount = amountInt + feeInt; // Sum is also a BigInt

      // Encode the approve function call
      const approveData = encodeFunctionData({
        abi: ERC20ContractConfig.abi,
        functionName: "approve",
        args: [RSKEscrowContractConfig.address.toLowerCase(), totalAmount],
      });

      // Encode the escrowERC20 function call
      const buyerSecret = randomBytes(32);
      const sellerSecret = randomBytes(32);
      const buyerHashBuffer = createHash("sha256").update(new Uint8Array(buyerSecret)).digest();
      const sellerHashBuffer = createHash("sha256").update(new Uint8Array(sellerSecret)).digest();
      const buyerHashBytes32 = "0x" + buyerHashBuffer.toString("hex");
      const sellerHashBytes32 = "0x" + sellerHashBuffer.toString("hex");

      const escrowParams = [
        order.id,
        ERC20ContractConfig.address.toLocaleLowerCase(),
        order.buyerAddress,
        buyerHashBytes32,
        sellerHashBytes32,
        amountInt,
        feeInt,
      ];

      const escrowData = encodeFunctionData({
        abi: RSKEscrowContractConfig.abi,
        functionName: "escrowERC20",
        args: escrowParams,
      });

      // Clear any existing operations
      await primeSdk.clearUserOpsFromBatch();

      // Add the approve operation to the batch
      await primeSdk.addUserOpsToBatch({
        to: ERC20ContractConfig.address,
        data: approveData,
      });

      // Add the escrow operation to the batch
      await primeSdk.addUserOpsToBatch({
        to: RSKEscrowContractConfig.address.toLowerCase(),
        data: escrowData,
      });

      // const arka_api_key =
      //   "eyJvcmciOiI2NTIzZjY5MzUwOTBmNzAwMDFiYjJkZWIiLCJpZCI6ImE3MDA0NWM5Y2IyNTQ3ODA5ZTgwOTVjNzUwYjAyYzM1IiwiaCI6Im11cm11cjEyOCJ9";
      const arka_api_key = 'arka_public_key';
      const arka_url = "https://arka.etherspot.io";
      const queryString = `?apiKey=${arka_api_key}&chainId=31`;
      // Estimate the operations added to the batch and get the fee data for the UserOp
      const op = await primeSdk.estimate()
      //   {
      //     paymasterDetails: {
      //       url: arka_url + queryString,
      //       context: {
      //         token: "PDOC",
      //         mode: 'erc20'
      //       }
      //     },
      //     gasDetails
      //   },
      // );

      console.log(`Estimate UserOp: ${await printOp(op)}`);

      // Sign the UserOp and send it to the bundler
      const uoHash = await primeSdk.send(op);
      console.log(`UserOpHash: ${uoHash}`);

      // Wait for the transaction receipt
      let userOpsReceipt = null;
      const timeout = Date.now() + 300000; // 5 minutes timeout
      while (userOpsReceipt == null && Date.now() < timeout) {
        await sleep(5);
        userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
      }
      console.log("Transaction Receipt: ", userOpsReceipt);

      return userOpsReceipt;
    } else {
      throw new Error("PrimeSdk instance or user address is not available.");
    }
  };

  return {
    // createSmartContractWallet,
    transferTokensToEtherspotWallet,
    transferTokensFromEtherspotToEOA,
    lockFunds,
    batchApproveAndEscrow
  };
};

export const usePaymaster = async (primeSdk: PrimeSdk) => {
  // const arka_api_key =
  //   "eyJvcmciOiI2NTIzZjY5MzUwOTBmNzAwMDFiYjJkZWIiLCJpZCI6ImE3MDA0NWM5Y2IyNTQ3ODA5ZTgwOTVjNzUwYjAyYzM1IiwiaCI6Im11cm11cjEyOCJ9";
  const arka_api_key = 'arka_public_key';
  const arka_url = "https://arka.etherspot.io";
  const queryString = `?apiKey=${arka_api_key}&chainId=31`;


  // const arka_url = 'https://arka.etherspot.io';
  // const queryString = `?apiKey=${arka_api_key}&chainId=1`;

  // const estimateResult = await primeSdk.estimate({
  //     paymasterDetails: {
  //         chainId: 1,
  //         url: arka_url
  //     },
  //     key: arka_api_key
  //     context: { mode: 'sponsor' }
  // });

  const estimateResult = await primeSdk.estimate({
    paymasterDetails: {
      url: `${arka_url}${queryString}`,
      context: { mode: "sponsor" },
    },
  });

  console.log("Estimate result:", estimateResult);
  return estimateResult;
};
