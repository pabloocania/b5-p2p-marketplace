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
import { Order, TransactionStatusResponse } from "b5-api-client";
import { useEtherspotSdk } from "@/lib/web3/EtherspotSdkProvider";
import { useState } from "react";
import { OPSReceipt } from "@/lib/web3/types";
import { useTransaction } from '@/lib/web3/TransactionContext';
import { arka_url, queryString } from '@/lib/web3/ArkaPaymaster'
import { arkaPaymasterInstance } from "@/lib/web3/ArkaPaymaster";
import { p2pMarketAPIClient } from "@/lib/APIClients";
import { useTranslation } from "react-i18next";


const publicClient = createPublicClient({
  chain: rootstockTestnet,
  transport: http(),
});

export const useEtherspotFlow = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const account = useAccount();
  const { primeSdk, swAddress } = useEtherspotSdk();
  const { setTransaction, resetTransaction } = useTransaction();
  const { t } = useTranslation();

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
  ): Promise<OPSReceipt> => {
    try {
      const userOpReceipt = await processBatchOperations(operations);
      return userOpReceipt;
    } catch (error) {
      return Promise.reject(new Error("Transaction failed"));
    }
  };

  const transferFromEOAToSW = async (
    tokenAddress: string,
    amount: string
  ): Promise<string> => {
    if (walletClient && address && primeSdk) {
      try {
        const etherspotAddress = await primeSdk.getCounterFactualAddress();
        const data = encodeFunctionData({
          abi: ERC20ContractConfig.abi,
          functionName: "transfer",
          args: [etherspotAddress, parseUnits(amount, 18)],
        });

        const transactionHash = await walletClient.sendTransaction({
          to: getAddress(tokenAddress),
          data: data,
        });
        return transactionHash
        // Assuming you have a way to get the transaction receipt after success
        // return await checkTransactionStatus(transactionHash);
      } catch (error) {
        console.error("Error during transaction:", error);
        return Promise.reject(error);
      }
    } else {
      return Promise.reject(new Error("Wallet client, address, or PrimeSdk instance is not available."));
    }
  };

  const checkTransactionStatus = async (transactionHash: string): Promise<TransactionStatusResponse> => {
    const pollInterval = 5000; // Poll every 5 seconds
    const timeout = Date.now() + 300000; // 5 minute timeout

    while (Date.now() < timeout) {
      try {
        const response = await p2pMarketAPIClient.getTransactionStatus(transactionHash);

        if (response.status === "SUCCESSFULL") {
          setTransaction({ status: "success", message: t("transaction_success"), progress: 100 });
          return response;
        } else if (response.status === "FAILED") {
          setTransaction({ status: "error", message: t("transaction_failed"), progress: 0 });
          return Promise.reject(new Error("Transaction failed"));
        } else if (response.status === "PENDING") {
          setTransaction({ status: "waiting", message: t("transaction_pending"), progress: 50 });
        }

        // Wait for the next poll
        await new Promise<void>(resolve => setTimeout(resolve, pollInterval));
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          console.error("Transaction not found:", error);
          setTransaction({ status: "error", message: t("transaction_not_found"), progress: 0 });
          return Promise.reject(new Error("Transaction not found"));
        } else {
          console.error("Error fetching transaction status:", error);
          setTransaction({ status: "error", message: t("transaction_status_error"), progress: 0 });
          return Promise.reject(error);
        }
      }
    }

    // If the loop exits due to timeout
    setTransaction({ status: "error", message: t("transaction_status_timeout"), progress: 0 });
    return Promise.reject(new Error("Transaction status check timed out"));
  };

  const transferTokensFromEtherspotToEOA = async (
    tokenAddress: string,
    amount: string,
  ): Promise<OPSReceipt> => {
    try {
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

        return await executeTransaction([operation]);
      }
      throw new Error("Address or PrimeSdk instance is not available.");
    } catch (error) {
      console.error("Error transferring tokens:", error);
      return Promise.reject(error);
    }
  };

  const releaseFunds = async (order: Order): Promise<OPSReceipt> => {
    try {
      if (primeSdk) {
        const releaseParams = [
          order.id,
          "0x" + order.buyerHash
        ];
        const releaseData = encodeFunctionData({
          abi: RSKEscrowContractConfig.abi,
          functionName: "releaseToBuyer",
          args: releaseParams,
        });
        console.log(releaseData);

        return await executeTransaction([
          { to: RSKEscrowContractConfig.address.toLowerCase(), data: releaseData }
        ]);
      } else {
        return Promise.reject("Smart wallet not defined");
      }
    } catch (error) {
      console.error("Error releasing funds:", error);
      return Promise.reject(error);
    }
  }

  const whitelistPaymaster = async (address: string): Promise<boolean> => {
    // const algo = await arkaPaymasterInstance.deposit(1)
    const isWhitelisted = await arkaPaymasterInstance.checkWhitelist(
      address
    );
    if (isWhitelisted !== "Already added") {
      console.log("whitelisting...");
      try {
        const response = await arkaPaymasterInstance.addWhitelist([
          address,
        ]);
        console.log("Got whitelisting response", response);
        return true;
      } catch (error) {
        console.log(error);
      }
    }
    return false;
  };

  const batchApproveAndEscrow = async (order: Order): Promise<OPSReceipt | undefined> => {
    if (primeSdk && address) {
      // console.log(await arkaPaymasterInstance.deposit(0.001))
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
      return executeTransaction(operations);
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
    await whitelistPaymaster(swAddress);
    // Estimate the operations added to the batch and get the fee data for the UserOp
    const op = await primeSdk.estimate(
      // {
      //   paymasterDetails: { url: `https://arka.etherspot.io?apiKey=arka_public_key&chainId=31`, context: { mode: 'sponsor' } }
      // }
      {
        paymasterDetails: {
          url: arka_url + queryString,
          context: { mode: "sponsor" },
        }
      }
    );

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

