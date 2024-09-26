import { rootstockTestnet } from "wagmi/chains";
import { RSKEscrowContractConfig } from "@/abis/RSKEscrowConfig";
import { printOp } from "@etherspot/prime-sdk/dist/sdk/common/OperationUtils";
import {
  createPublicClient,
  http,
  getContract,
  stringToHex,
  encodeFunctionData,
  formatUnits,
  parseUnits,
} from "viem";
import { usePublicClient } from "wagmi";
import { PrimeSdk } from "@etherspot/prime-sdk";
import { ERC20ContractConfig } from "@/abis/ERC20ContractConfig";
import { sleep } from "@etherspot/prime-sdk/dist/sdk/common";

export const useEscrowERC20 = async (primeSdk: PrimeSdk) => {
  const client = usePublicClient();
  //   const wallet = useWalletClient();

  const rskEscrowContract = getContract({
    address: RSKEscrowContractConfig.address,
    abi: RSKEscrowContractConfig.abi,
    client: {
      public: client!,
      //   wallet: wallet,
    },
  });

  // Encode the escrowERC20 function call
  const transactionData = encodeFunctionData({
    abi: RSKEscrowContractConfig.abi,
    functionName: "escrowERC20",
    args: [
      "orderId123", // _orderId
      ERC20ContractConfig.address, // _tokenContractAddress
      "0xF0821a3045941dC32CE00c0b00Db3F9645A2adFB", // _buyerAddress
      stringToHex("buyerHash"), // _buyerHash
      stringToHex("sellerHash"), // sellerHash
      parseUnits("1", 18), // _amount
      parseUnits("0.01", 18), // _fee
    ],
  });

  // Clear the transaction batch
  await primeSdk.clearUserOpsFromBatch();

  // Add transactions to the batch
  const userOpsBatch = await primeSdk.addUserOpsToBatch({
    to: RSKEscrowContractConfig.address,
    data: transactionData,
  });
  console.log("Transactions: ", userOpsBatch);
  // Estimate transactions added to the batch and get the fee data for the UserOp
  const op = await primeSdk.estimate();
  console.log("Estimate UserOp: ", await printOp(op));
  // Sign the UserOp and send it to the bundler
  const uoHash = await primeSdk.send(op);
  console.log("UserOpHash: ", uoHash);
  // Get transaction receipt
  console.log("Waiting for transaction...");
  let userOpsReceipt = null;
  const timeout = Date.now() + 60000; // 1 minute timeout
  while (userOpsReceipt == null && Date.now() < timeout) {
    await sleep(2000);
    userOpsReceipt = await primeSdk.getUserOpReceipt(uoHash);
  }
  console.log("Transaction Receipt: ", userOpsReceipt);
};
