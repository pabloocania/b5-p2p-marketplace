import { useAccount, useWalletClient } from "wagmi";
import {
  createPublicClient,
  http,
  getAddress,
  encodeFunctionData,
  formatUnits,
  parseUnits,
} from "viem";
import { rootstockTestnet } from "wagmi/chains";
import { ERC20ContractConfig } from "../abis/ERC20ContractConfig";
import { RSKEscrowContractConfig } from "@/abis/RSKEscrowConfig";
import { sleep } from "@etherspot/prime-sdk/dist/sdk/common";
import { printOp } from "@etherspot/prime-sdk/dist/sdk/common/OperationUtils";
import { createHash, randomBytes } from "crypto";
import { Order } from "b5-api-client";
import { useEtherspotSdk } from "@/lib/web3/EtherspotSdkProvider";
import { ArkaPaymaster } from "@etherspot/prime-sdk";
import { useState } from "react";
import { OPSReceipt } from "@/lib/web3/types";
import { useTransaction } from '@/lib/web3/TransactionContext';


const publicClient = createPublicClient({
  chain: rootstockTestnet,
  transport: http(),
});

// const arka_api_key = 'eyJvcmciOiI2NTIzZjY5MzUwOTBmNzAwMDFiYjJkZWIiLCJpZCI6ImUzZmE2NzQ2ZDI3MTQ4ZWQ4OTYyNjg3YzQ2MzJjMDE4IiwiaCI6Im11cm11cjEyOCJ9';
const arka_api_key = 'arka_public_key';
const arka_url = 'https://arka.etherspot.io';
const queryString = `?apiKey=${arka_api_key}&chainId=31`;


export const useEtherspotFlow = () => {
  const [isTransacting, setIsTransacting] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const account = useAccount();
  const { primeSdk } = useEtherspotSdk();
  const { setTransaction, resetTransaction } = useTransaction();
  const arkaPaymaster = new ArkaPaymaster(31, arka_api_key, arka_url);

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

  // Example of updating transaction status
  const executeTransaction = async (
    operations: { to: string; data: string }[],
    successMessage: string
  ): Promise<OPSReceipt> => {
    try {
      setIsTransacting(true);
      setTransaction({ status: "sent", message: "Initiating transaction...", progress: 0 });
      setTimeout(() => {
        setTransaction({ status: "waiting", message: "Approve and lock your tokens", progress: 45 });
      }, 1000);

      const userOpReceipt = await processBatchOperations(operations);

      if (userOpReceipt.success) {
        setTransaction({ status: "success", message: successMessage, progress: 100 });
      } else {
        setTransaction({ status: "error", message: "Transaction failed. Please try again.", progress: 0 });
        return Promise.reject(new Error("Transaction failed"));
      }

      console.log(userOpReceipt);
      return userOpReceipt;
    } catch (error) {
      setTransaction({ status: "error", message: "Transaction failed. Please try again.", progress: 0 });
      console.log(error);
      return Promise.reject(new Error("Transaction failed"));
    } finally {
      setIsTransacting(false);
    }
  };

  const transferFromEOAToSW = async (
    tokenAddress: string,
    amount: string
  ) => {
    if (walletClient && address && primeSdk) {
      try {
        setIsTransacting(true);
        setTransaction({ status: "sent", message: "Initiating transaction...", progress: 10 });
        const etherspotAddress = await primeSdk.getCounterFactualAddress();
        const data = encodeFunctionData({
          abi: ERC20ContractConfig.abi,
          functionName: "transfer",
          args: [etherspotAddress, parseUnits(amount, 18)],
        });
        const userOpReceipt = await walletClient.sendTransaction({
          to: getAddress(tokenAddress),
          data: data,
        });

        if (userOpReceipt) {
          setTransaction({ status: "success", message: "Transaction successful", progress: 100 });
        } else {
          setTransaction({ status: "error", message: "Transaction failed. Please try again.", progress: 0 });
          return Promise.reject(new Error("Transaction failed"));
        }

      } catch (error) {
        setTransaction({ status: "error", message: "Transaction failed. Please try again.", progress: 0 });
      } finally {
        setIsTransacting(false);
      }
    }
  };

  const whitelist = async (address: string) => {
    const isWhitelisted = await arkaPaymaster.checkWhitelist(account.address!!)
    if (isWhitelisted !== "Already added") {
      await arkaPaymaster.addWhitelist([account.address!!])
    }
  }

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

      // Prepare the operation data
      const operation = {
        to: tokenAddress,
        data: data,
      };

      return await executeTransaction([operation], "Funds locked in the smart contract");
    }
  };

  const releaseFunds = async (order: Order): Promise<OPSReceipt> => {
    if (primeSdk) {
      const releaseParams = [
        order.id,
        "0x" + order.buyerHash
      ];
      console.log(releaseParams);
      const releaseData = encodeFunctionData({
        abi: RSKEscrowContractConfig.abi,
        functionName: "releaseToBuyer",
        args: releaseParams,
      });
      console.log(releaseData)

      return await executeTransaction([
        { to: RSKEscrowContractConfig.address.toLowerCase(), data: releaseData }
      ], "Funds released successfully");
    }
    return Promise.reject(new Error("Transaction conditions not met"));
  }

  const batchApproveAndEscrow = async (order: Order): Promise<OPSReceipt> => {
    if (primeSdk && address && !isTransacting) {
      const amountInt = parseUnits(order.amount ?? "0", 18); // Ensure order.amount is not undefined
      const feeInt = amountInt / BigInt(100); // Calculate the fee as a BigInt
      const totalAmount = amountInt + feeInt; // Sum is also a BigInt

      // Encode the approve function call
      const approveData = encodeFunctionData({
        abi: ERC20ContractConfig.abi,
        functionName: "approve",
        args: [RSKEscrowContractConfig.address.toLowerCase(), totalAmount],
      });

      const ba = hexStringToByteArray(order.buyerHash!!)
      const sa = hexStringToByteArray(order.sellerHash!!)

      const buyerHashBuffer = ba
        ? createHash("sha256").update(ba).digest('hex')
        : undefined;

      const sellerHashBuffer = sa
        ? createHash("sha256").update(sa).digest('hex')
        : undefined;

      const escrowParams = [
        order.id,
        ERC20ContractConfig.address.toLocaleLowerCase(),
        order.buyerAddress,
        `0x${buyerHashBuffer}`,
        `0x${sellerHashBuffer}`,
        amountInt,
        feeInt,
      ];

      const escrowData = encodeFunctionData({
        abi: RSKEscrowContractConfig.abi,
        functionName: "escrowERC20",
        args: escrowParams,
      });

      const operations = [
        { to: ERC20ContractConfig.address, data: approveData },
        { to: RSKEscrowContractConfig.address.toLowerCase(), data: escrowData }
      ];

      return await executeTransaction(operations, "Funds locked in the smart contract");
    } else {
      throw new Error("PrimeSdk instance or user address is not available.");
    }
  };

  const processBatchOperations = async (operations: { to: string, data: string }[]): Promise<OPSReceipt> => {
    if (!primeSdk) {
      throw new Error("PrimeSdk instance is not available.");
    }

    // Clear any existing operations
    await primeSdk.clearUserOpsFromBatch();

    // Add each operation to the batch
    for (const operation of operations) {
      await primeSdk.addUserOpsToBatch(operation);
    }

    // Estimate the operations added to the batch and get the fee data for the UserOp
    const op = await primeSdk.estimate({
      paymasterDetails: {
        url: arka_url + queryString,
        context: { mode: "sponsor" },
      }
    });

    console.log("Estimate UserOp: ", await printOp(op));

    // Sign the UserOp and send it to the bundler
    const uoHash = await primeSdk.send(op);
    console.log("UserOpHash: ", uoHash);

    // Wait for the transaction receipt
    let userOpsReceipt = null;
    const timeout = Date.now() + 300000; // 5 minute timeout
    while (userOpsReceipt == null && Date.now() < timeout) {
      await sleep(5);
      userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
    }

    console.log("Transaction Receipt: ", userOpsReceipt);
    return userOpsReceipt;
  };

  function hexStringToByteArray(hexString: string): Uint8Array {
    if (hexString.length % 2 !== 0) {
      throw new Error("Invalid hex string. Length must be even.");
    }

    const byteArray = new Uint8Array(hexString.length / 2);

    for (let i = 0; i < hexString.length; i += 2) {
      byteArray[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }

    return byteArray;
  }

  return {
    transferFromEOAToSW,
    transferTokensFromEtherspotToEOA,
    batchApproveAndEscrow,
    releaseFunds
  };
};

