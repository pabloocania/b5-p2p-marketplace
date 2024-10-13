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


const publicClient = createPublicClient({
  chain: rootstockTestnet,
  transport: http(),
});

// const arka_api_key = 'eyJvcmciOiI2NTIzZjY5MzUwOTBmNzAwMDFiYjJkZWIiLCJpZCI6ImUzZmE2NzQ2ZDI3MTQ4ZWQ4OTYyNjg3YzQ2MzJjMDE4IiwiaCI6Im11cm11cjEyOCJ9';
const arka_api_key = 'arka_public_key';
const arka_url = 'https://arka.etherspot.io';
const queryString = `?apiKey=${arka_api_key}&chainId=31`;


export const useEtherspotFlow = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const account = useAccount();
  const { primeSdk } = useEtherspotSdk();
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

  const whitelist = async (address: string) => {
    const isWhitelisted = await arkaPaymaster.checkWhitelist(account.address!!)
    if (isWhitelisted !== "Already added") {
      console.log("Whitelist", await arkaPaymaster.addWhitelist([account.address!!]))
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

      // Use the new helper function to process the operation
      const userOpsReceipt = await processBatchOperations([operation]);

      console.log("\x1b[33m%s\x1b[0m", `Transaction Receipt: `, userOpsReceipt);
      if (userOpsReceipt.success == true) {
        console.log("receipt true");
      } else {
        console.log("receipt false");
      }
    }
  };

  //     // console.log(await arkaPaymaster.metadata())
  //     // console.log(await arkaPaymaster.getTokenPaymasterAddress("USDC"))
  //     // console.log(await arkaPaymaster.addWhitelist([swAddress]))


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

      // Prepare the operation data
      const operation = {
        to: tokenAddress,
        data: data,
      };

      // Use the new helper function to process the operation
      const userOpsReceipt = await processBatchOperations([operation]);

      return userOpsReceipt;
    } else {
      throw new Error("PrimeSdk instance or user address is not available.");
    }
  };

  const releaseFunds = async (order: Order) => {
    if (primeSdk) {
      // const buyerHashBuffer = createHash('sha256').update(order.buyerHash).digest('hex')
      // const testHex = "0x" + buyerHashBuffer.toString("hex");
      // console.log(testHex)
      const releaseParams = [
        order.id,
        // order.buyerHash!!
        "0x" + order.buyerHash
        // "0x" + buyerHashBuffer.toString("hex").padStart(64, '0')
        // "0x" + buyerHashBuffer
      ];
      console.log(releaseParams);
      const releaseData = encodeFunctionData({
        abi: RSKEscrowContractConfig.abi,
        functionName: "releaseToBuyer",
        args: releaseParams,
      });
      console.log(releaseData)

      // Use the new helper function to process the batch operations
      await processBatchOperations([
        { to: RSKEscrowContractConfig.address.toLowerCase(), data: releaseData }
      ]);
    }
  }

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

      console.log(escrowParams)

      const escrowData = encodeFunctionData({
        abi: RSKEscrowContractConfig.abi,
        functionName: "escrowERC20",
        args: escrowParams,
      });
      // Use the new helper function to process the batch operations
      await processBatchOperations([
        { to: ERC20ContractConfig.address, data: approveData },
        { to: RSKEscrowContractConfig.address.toLowerCase(), data: escrowData }
      ]);

    } else {
      throw new Error("PrimeSdk instance or user address is not available.");
    }
  };

  const processBatchOperations = async (operations: { to: string, data: string }[]) => {
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

  return {
    transferTokensToEtherspotWallet,
    transferTokensFromEtherspotToEOA,
    batchApproveAndEscrow,
    releaseFunds
  };
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