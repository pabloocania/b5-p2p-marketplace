import { useAccount, useWalletClient } from "wagmi";
import {
  getAddress,
  encodeFunctionData,
  parseUnits,
  parseGwei
} from "viem";
import { ERC20abi } from "@/components/web3/abis/StablecoinConfig";
import { Order } from "b5-api-client";
import { useKioscoinWallet } from "@/components/web3/AccountAbstraction/KioscoinWalletProvider";
import { OPSReceipt } from "@/components/web3/types";
import { KioscoinEscrowContractConfig } from "@/components/web3/abis/KioscoinEscrowConfig";
import { PublicClientManager } from "@/components/web3/PublicClientManager";
import { ConfigStore } from "@/lib/ConfigStore";
import { useWeb3Auth } from "@web3auth/modal/react";
import { TransactionGasInfoForUserOp } from "@etherspot/prime-sdk/dist/sdk/base/TransactionDetailsForUserOp";
import { printOp } from "@etherspot/prime-sdk/dist/sdk/common/OperationUtils";
import { arka_api_key, whitelistPaymaster } from "./ArkaPaymasterService";
import { EtherspotSdksManager } from "./EtherspotSdksManager";
import { p2pMarketAPIClient } from "@/lib/APIClients";
import { useKioscoinUserContext } from "@/components/kioscoin/users/KioscoinUserContext";

export const useEtherspotFlow = () => {
  // const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { isConnected: isConnectedWeb3Auth } = useWeb3Auth();
  const { primeSdk, eoaAddress, swAddress } = useKioscoinWallet();
  const { loginId } = useKioscoinUserContext();

  const fetchOrderSecret = async (
    orderId: string
  ): Promise<{ role: string; secret: string }> => {
    if (!orderId) {
      throw new Error("Order id is required to fetch secret.");
    }
    if (!loginId) {
      throw new Error("User is not authenticated.");
    }
    const response = await p2pMarketAPIClient.getOrderSecret(orderId, {
      Authorization: `Bearer ${loginId}`,
    });
    if (!response?.secret) {
      throw new Error("Secret not available for this order.");
    }
    return response;
  };

  const fetchEscrowSecretsForSeller = async (
    orderId: string
  ): Promise<{ buyerSecret: string; sellerSecret: string }> => {
    if (!orderId) {
      throw new Error("Order id is required to fetch escrow secrets.");
    }
    if (!loginId) {
      throw new Error("User is not authenticated.");
    }
    const response = await p2pMarketAPIClient.getEscrowSecretsForSeller(orderId, {
      Authorization: `Bearer ${loginId}`,
    });
    if (!response?.buyerSecret || !response?.sellerSecret) {
      throw new Error("Escrow secrets not available for this order.");
    }
    return response;
  };


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

  const transferTokens = async (
    tokenAddress: string,
    destinationAddress: string,
    amount: string,
    chainId: number
  ): Promise<string | undefined> => {
    try {
      if (!primeSdk) {
        throw new Error("PrimeSdk instance is not available.");
      }

      const data = encodeFunctionData({
        abi: ERC20abi,
        functionName: "transfer",
        args: [getAddress(destinationAddress), amount],
      });

      const operation = {
        to: tokenAddress,
        data: data,
      };

      return await executeTransaction([operation], chainId);
    } catch (error) {
      console.error("Error transferring tokens:", error);
      return Promise.reject(error);
    }
  };

  const releaseFunds = async (order: Order): Promise<string | undefined> => {
    try {
      const contractAddress = ConfigStore.getInstance().getKioscoinEscrowAddressByBlockchain(order.blockchain!!)
      if (primeSdk) {
        const orderId = order.id ?? "";
        const secretResponse = await fetchOrderSecret(orderId);
        const releaseParams = [
          orderId,
          secretResponse.secret
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
      const orderId = order.id ?? "";
      const { buyerSecret, sellerSecret } = await fetchEscrowSecretsForSeller(orderId);
      if (!order.buyerAddress) {
        throw new Error("Buyer address is required to lock the order.");
      }
      const contractAddress = ConfigStore.getInstance().getKioscoinEscrowAddressByBlockchain(orderBlockchain)
      const tokenDecimals = ConfigStore.getInstance().getTokenDecimalsByTokenCodeAndBlockchain(order.tokenCode, orderBlockchain)
      const amountInt = parseUnits(order.amount ?? "0", tokenDecimals); // Ensure order.amount is not undefined
      const feeInt = amountInt / BigInt(100); // Calculate the fee as a BigInt
      const totalAmount = amountInt + feeInt; // Sum is also a BigInt

      // Encode the approve function call
      const approveData = encodeFunctionData({
        abi: ERC20abi,
        functionName: "approve",
        args: [contractAddress, totalAmount],
      });

      const buyerHashBuffer = buyerSecret;
      const sellerHashBuffer = sellerSecret;

      const tokenAddress = ConfigStore.getInstance().getTokenAddressByNameAndBlockchain(order.tokenCode?.toUpperCase()!!, orderBlockchain)
      const escrowParams = [
        orderId,
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

  // Example of updating transaction status
  const executeTransaction = async (
    operations: { to: string; data: string }[],
    chainId: number
  ): Promise<string | undefined> => {
    try {
      const userOpReceipt = await processBatchOperations(operations, chainId);
      return userOpReceipt;
    } catch (error) {
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
    await whitelistPaymaster(swAddress);

    // 4. Get current network state
    const client = PublicClientManager.getInstance({ chainId });
    const block = await client.getBlock({ blockTag: "latest" });
    const baseFee = block?.baseFeePerGas ?? BigInt(0);

    // 5. Get network-specific gas settings with dynamic adjustment
    const currentBlockchain = EtherspotSdksManager.getInstance().mapNetworkNameToFormattedName(
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

    // Some chains (BSC, etc.) require maxFeePerGas === maxPriorityFeePerGas
    // Check if we're on a chain that requires equal gas values
    const chainsRequiringEqualGas = [56, 97]; // BSC Mainnet, BSC Testnet
    const requiresEqualGas = chainsRequiringEqualGas.includes(chainId);

    let maxFeePerGas: bigint;
    if (requiresEqualGas) {
      // For chains that require equal gas values
      maxFeePerGas = maxPriorityFeePerGas;
    } else {
      // For EIP-1559 compatible chains (Ethereum, Arbitrum, etc.)
      maxFeePerGas = baseFee + maxPriorityFeePerGas * BigInt(2);
    }

    const gasDetails: TransactionGasInfoForUserOp = {
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    };
    const op = await primeSdk.estimate({
      paymasterDetails: {
        url:
          "https://arka.etherspot.io?useVp=true&apiKey=" +
          process.env.NEXT_PUBLIC_ARKA_KEY +
          "&chainId=" +
          chainId,
        context: { mode: "sponsor" },
      },
      gasDetails: gasDetails,
    });
    await printOp(op)
    try {
      return await primeSdk.send(op);
    } catch (error) {
      console.error("Error sending UserOp:", error);
      return undefined;
    }
  };

  return {
    transferFromEOAToSW,
    transferFromSmartWalletToEOA,
    transferTokens,
    batchApproveAndEscrow,
    releaseFunds,
    getUserOperationReceipt,
  };
};
