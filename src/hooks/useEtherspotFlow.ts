import { useAccount, useWalletClient } from "wagmi";
import {
  getAddress,
  encodeFunctionData,
  parseUnits,
} from "viem";
import { ERC20abi, getTokenAddressByNameAndBlockchain } from "../abis/StablecoinConfig";
import { sleep } from "@etherspot/prime-sdk/dist/sdk/common";
import { printOp } from "@etherspot/prime-sdk/dist/sdk/common/OperationUtils";
import { createHash } from "crypto";
import { Order } from "b5-api-client";
import { useEtherspotSdk } from "@/lib/web3/EtherspotSdkProvider";
import { OPSReceipt } from "@/lib/web3/types";
import { getKioscoinEscrowAddressByBlockchain, KioscoinEscrowContractConfig } from "@/abis/KioscoinEscrowConfig";
import { ArkaPaymaster } from "@etherspot/prime-sdk";
import { PublicClientManager } from "@/lib/web3/PublicClientManager";

export const arka_api_key = 'arka_public_key';
export const arka_url = 'https://arka.etherspot.io';
export const queryString = `?apiKey=${arka_api_key}&chainId=`;


export const useEtherspotFlow = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { primeSdk, swAddress } = useEtherspotSdk();

  let arkaPaymasterInstance: ArkaPaymaster | null = null;

  const getArkaPaymasterInstance = (chainId: number, arkaApiKey: string, arkaUrl: string): ArkaPaymaster => {
    if (!arkaPaymasterInstance) {
      arkaPaymasterInstance = new ArkaPaymaster(chainId, arkaApiKey, arkaUrl);
    }
    return arkaPaymasterInstance;
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
          abi: ERC20abi,
          functionName: "transfer",
          args: [etherspotAddress, parseUnits(amount, 18)],
        });

        const transactionHash = await walletClient.sendTransaction({
          to: getAddress(tokenAddress),
          data: data,
        });
        return transactionHash
      } catch (error) {
        console.error("Error during transaction:", error);
        return Promise.reject(error);
      }
    } else {
      return Promise.reject(new Error("Wallet client, address, or PrimeSdk instance is not available."));
    }
  };

  const transferTokensFromEtherspotToEOA = async (
    tokenAddress: string,
    amount: string,
    chainId: number
  ): Promise<OPSReceipt> => {
    try {
      if (address && primeSdk) {
        const data = encodeFunctionData({
          abi: ERC20abi,
          functionName: "transfer",
          args: [address, parseUnits(amount, 18)],
        });

        // Prepare the operation data
        const operation = {
          to: tokenAddress,
          data: data,
        };
        return await executeTransaction([operation], chainId);
      }
      throw new Error("Address or PrimeSdk instance is not available.");
    } catch (error) {
      console.error("Error transferring tokens:", error);
      return Promise.reject(error);
    }
  };

  const releaseFunds = async (order: Order): Promise<OPSReceipt> => {
    try {
      const contractAddress = getKioscoinEscrowAddressByBlockchain(order.blockchain!!)
      if (primeSdk) {
        const releaseParams = [
          order.id,
          "0x" + order.buyerHash
        ];
        const releaseData = encodeFunctionData({
          abi: KioscoinEscrowContractConfig.abi,
          functionName: "releaseToBuyer",
          args: releaseParams,
        });
        const chainId = PublicClientManager.getChainIdForBlockchain(order.blockchain!!)
        return await executeTransaction([
          { to: contractAddress, data: releaseData }
        ], chainId!!);
      } else {
        return Promise.reject("Smart wallet not defined");
      }
    } catch (error) {
      console.error("Error releasing funds:", error);
      return Promise.reject(error);
    }
  }

  const whitelistPaymaster = async (address: string, chainId: number): Promise<boolean> => {
    const arkaPaymaster = getArkaPaymasterInstance(chainId, arka_api_key, arka_url);
    // const algo = await arkaPaymasterInstance.deposit(1)
    const isWhitelisted = await arkaPaymaster.checkWhitelist(
      address
    );
    if (isWhitelisted !== "Already added") {
      console.log("whitelisting...");
      try {
        const response = await arkaPaymaster.addWhitelist([
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
      const orderBlockchain = order.blockchain!!
      const contractAddress = getKioscoinEscrowAddressByBlockchain(orderBlockchain)
      console.log("contractAddress", contractAddress)
      // console.log(await arkaPaymasterInstance.deposit(0.001))
      const amountInt = parseUnits(order.amount ?? "0", 18); // Ensure order.amount is not undefined
      const feeInt = amountInt / BigInt(100); // Calculate the fee as a BigInt
      const totalAmount = amountInt + feeInt; // Sum is also a BigInt

      // Encode the approve function call
      const approveData = encodeFunctionData({
        abi: ERC20abi,
        functionName: "approve",
        args: [contractAddress, totalAmount],
      });

      const ba = hexStringToByteArray(order.buyerHash!!)
      const sa = hexStringToByteArray(order.sellerHash!!)

      const buyerHashBuffer = ba
        ? createHash("sha256").update(ba).digest('hex')
        : undefined;

      const sellerHashBuffer = sa
        ? createHash("sha256").update(sa).digest('hex')
        : undefined;

      console.log("tokenCode", order.tokenCode?.toUpperCase()!!)

      const address = getTokenAddressByNameAndBlockchain(order.tokenCode?.toUpperCase()!!, orderBlockchain)
      console.log("address", address)
      const escrowParams = [
        order.id,
        address,
        order.buyerAddress,
        `0x${buyerHashBuffer}`,
        `0x${sellerHashBuffer}`,
        amountInt,
        feeInt,
      ];
      console.log("escrowP", escrowParams)
      const escrowData = encodeFunctionData({
        abi: KioscoinEscrowContractConfig.abi,
        functionName: "escrowERC20",
        args: escrowParams,
      });

      const operations = [
        { to: address, data: approveData },
        { to: contractAddress, data: escrowData }
      ];
      const chainId = PublicClientManager.getChainIdForBlockchain(order.blockchain!!)
      return executeTransaction(operations, chainId!!);
    } else {
      throw new Error("PrimeSdk instance or user address is not available.");
    }
  };

  const processBatchOperations = async (
    operations: { to: string, data: string }[],
    chainId: number
  ): Promise<OPSReceipt> => {
    if (!primeSdk) {
      throw new Error("PrimeSdk instance is not available.");
    }

    // Clear any existing operations
    await primeSdk.clearUserOpsFromBatch();

    // Add each operation to the batch
    for (const operation of operations) {
      await primeSdk.addUserOpsToBatch(operation);
    }
    await whitelistPaymaster(swAddress, chainId);
    // Estimate the operations added to the batch and get the fee data for the UserOp

    //
    const op = await primeSdk.estimate(
      // {
      //   paymasterDetails: { url: `https://arka.etherspot.io?apiKey=arka_public_key&chainId=31`, context: { mode: 'sponsor' } }
      // }
      {
        paymasterDetails: {
          url: arka_url + queryString + chainId,
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
