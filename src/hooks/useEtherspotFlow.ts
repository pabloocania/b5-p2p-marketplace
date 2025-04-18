import { useAccount, useWalletClient } from "wagmi";
import {
  getAddress,
  encodeFunctionData,
  parseUnits,
  keccak256
} from "viem";
import { toUtf8Bytes } from "ethers/lib/utils";
import { ERC20abi } from "../abis/StablecoinConfig";
import { Order } from "b5-api-client";
import { useEtherspotSdk } from "@/lib/web3/EtherspotSdkProvider";
import { OPSReceipt } from "@/lib/web3/types";
import { getKioscoinEscrowAddressByBlockchain, KioscoinEscrowContractConfig } from "@/abis/KioscoinEscrowConfig";
import { PublicClientManager } from "@/lib/web3/PublicClientManager";
import { ConfigStore } from "@/lib/ConfigStore";

export const arka_api_key = "etherspot_3ZVooGBfUwejKEQFJzmvMxKK";
export const arka_url = "https://arka.etherspot.io";
export const queryString = `?apiKey=${arka_api_key}&chainId=`;


export const useEtherspotFlow = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { primeSdk, executeTransaction } = useEtherspotSdk();


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
          args: [etherspotAddress, amount],
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

  const transferFromSmartWalletToEOA = async (
    tokenAddress: string,
    amount: string,
    chainId: number
  ): Promise<string | undefined> => {
    try {
      if (address && primeSdk) {
        console.log(address);
        const data = encodeFunctionData({
          abi: ERC20abi,
          functionName: "transfer",
          args: [address, amount],
        });
        console.log(data);

        // Prepare the operation data
        const operation = {
          to: tokenAddress,
          data: data,
        };
        console.log(operation);
        return await executeTransaction([operation], chainId);
      }
      throw new Error("Address or PrimeSdk instance is not available.");
    } catch (error) {
      console.error("Error transferring tokens:", error);
      return Promise.reject(error);
    }
  };

  const releaseFunds = async (order: Order): Promise<string | undefined> => {
    try {
      const contractAddress = getKioscoinEscrowAddressByBlockchain(order.blockchain!!)
      if (primeSdk) {
        const releaseParams = [
          order.id,
          order.buyerHash
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

  const batchApproveAndEscrow = async (order: Order): Promise<string | undefined> => {
    if (primeSdk && address) {
      const orderBlockchain = order.blockchain!!
      const contractAddress = getKioscoinEscrowAddressByBlockchain(orderBlockchain)
      const amountInt = parseUnits(order.amount ?? "0", 18); // Ensure order.amount is not undefined
      const feeInt = amountInt / BigInt(100); // Calculate the fee as a BigInt
      const totalAmount = amountInt + feeInt; // Sum is also a BigInt

      // Encode the approve function call
      const approveData = encodeFunctionData({
        abi: ERC20abi,
        functionName: "approve",
        args: [contractAddress, totalAmount],
      });

      const buyerHashBuffer = order.buyerHash ? keccak256(toUtf8Bytes(order.buyerHash)) : undefined;
      const sellerHashBuffer = order.sellerHash ? keccak256(toUtf8Bytes(order.sellerHash)) : undefined;

      const address = ConfigStore.getInstance().getTokenAddressByNameAndBlockchain(order.tokenCode?.toUpperCase()!!, orderBlockchain)
      const escrowParams = [
        order.id,
        address,
        order.buyerAddress,
        buyerHashBuffer,
        sellerHashBuffer,
        amountInt,
        feeInt,
      ];
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

  const getUserOperationReceipt = async (userOperationHash: string): Promise<OPSReceipt | undefined> => {
    console.log(userOperationHash);
    console.log(primeSdk);
    if (primeSdk && userOperationHash !== "") {
      return await primeSdk.getUserOpReceipt(userOperationHash);
    }
    return undefined;
  }

  return {
    transferFromEOAToSW,
    transferFromSmartWalletToEOA,
    batchApproveAndEscrow,
    releaseFunds,
    getUserOperationReceipt
  };
};
