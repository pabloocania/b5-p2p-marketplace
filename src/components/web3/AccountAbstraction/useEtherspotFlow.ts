import { useAccount, useWalletClient } from "wagmi";
import {
  getAddress,
  encodeFunctionData,
  parseUnits,
  keccak256
} from "viem";
import { toUtf8Bytes } from "ethers/lib/utils";
import { ERC20abi } from "@/components/web3/abis/StablecoinConfig";
import { Order } from "b5-api-client";
import { useEtherspotSdk } from "@/components/web3/AccountAbstraction/EtherspotSdkProvider";
import { OPSReceipt } from "@/components/web3/types";
import { getKioscoinEscrowAddressByBlockchain, KioscoinEscrowContractConfig } from "@/components/web3/abis/KioscoinEscrowConfig";
import { PublicClientManager } from "@/components/web3/PublicClientManager";
import { ConfigStore } from "@/lib/ConfigStore";
import { useWeb3Auth } from "@web3auth/modal/react";

export const useEtherspotFlow = () => {
  // const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { isConnected: isConnectedWeb3Auth } = useWeb3Auth();
  const { primeSdk, executeTransaction, eoaAddress } = useEtherspotSdk();


  const transferFromEOAToSW = async (
    tokenAddress: string,
    amount: string
  ): Promise<string> => {
    if (primeSdk) {
      try {
        const etherspotAddress = await primeSdk.getCounterFactualAddress();

        const data = encodeFunctionData({
          abi: ERC20abi,
          functionName: "transfer",
          args: [etherspotAddress, amount],
        });


        const transactionHash = await walletClient?.sendTransaction({
          to: getAddress(tokenAddress),
          data: data,
        });
        return transactionHash ?? ""
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
      if (primeSdk) {
        const data = encodeFunctionData({
          abi: ERC20abi,
          functionName: "transfer",
          args: [eoaAddress, amount],
        });
        console.log("Transfer data:", {
          tokenAddress,
          amount
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

  const releaseFunds = async (order: Order): Promise<string | undefined> => {
    try {
      const contractAddress = ConfigStore.getInstance().getKioscoinEscrowAddressByBlockchain(order.blockchain!!)
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
    if (primeSdk && isConnectedWeb3Auth) {
      const orderBlockchain = order.blockchain!!
      const contractAddress = ConfigStore.getInstance().getKioscoinEscrowAddressByBlockchain(orderBlockchain)
      const tokenDecimals = ConfigStore.getInstance().getTokenDecimalsByTokenCode(order.tokenCode)
      const amountInt = parseUnits(order.amount ?? "0", tokenDecimals); // Ensure order.amount is not undefined
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

      const tokenAddress = ConfigStore.getInstance().getTokenAddressByNameAndBlockchain(order.tokenCode?.toUpperCase()!!, orderBlockchain)
      const escrowParams = [
        order.id,
        tokenAddress,
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
        { to: tokenAddress, data: approveData },
        { to: contractAddress, data: escrowData }
      ];
      const chainId = PublicClientManager.getChainIdForBlockchain(order.blockchain!!)
      return executeTransaction(operations, chainId);
    } else {
      throw new Error("PrimeSdk instance or user address is not available.");
    }
  };

  const getUserOperationReceipt = async (userOperationHash: string): Promise<OPSReceipt | undefined> => {
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
