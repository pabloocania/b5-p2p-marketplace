import React, { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";
import StablecoinBalance from "./StablecoinBalance";
import { ERC20ContractConfig } from "@/abis/ERC20ContractConfig";

interface Stablecoin {
  name: string;
  eoaBalance: string;
  smartWalletBalance: string;
}

const EtherspotInstance: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<string>("");
  const [stablecoin, setStablecoin] = useState<Stablecoin>();
  const { data: walletClient } = useWalletClient();
  const [isPrimeConnected, setIsPrimeConnected] = useState<boolean>(false);

  const {
    createSmartContractWallet,
    transferTokensToEtherspotWallet,
    transferTokensFromEtherspotToEOA,
    lockFunds,
  } = useEtherspotFlow();

  useEffect(() => {
    if (walletClient && !isPrimeConnected) {
      createSmartContractWallet().then((stablecoinBalance) => {
        setStablecoin(stablecoinBalance);
      });
      setIsPrimeConnected(true);
    }
  }, [walletClient, isPrimeConnected, createSmartContractWallet]);

  const sendToEtherspot = () => {
    transferTokensToEtherspotWallet(
      ERC20ContractConfig.address,
      amount,
      walletClient,
    );
  };

  const handleLockFunds = async () => {
    const algo = await lockFunds(amount);
    console.log(algo);
  };

  const handleSendToEOA = async () => {
    const algo = await transferTokensFromEtherspotToEOA(
      ERC20ContractConfig.address,
      amount,
    );
    // const algo = await lockFunds(walletClient);
    console.log(algo);
  };

  return (
    <div>
      {
        !isConnected ? (
          <ConnectButton
            chainStatus="name"
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
          />
        ) : stablecoin ? (
          <div>
            <p>EOA Balance</p>
            <StablecoinBalance
              name={stablecoin.name}
              balance={stablecoin.eoaBalance}
            />
            <p>Etherspot balance</p>
            <StablecoinBalance
              name={stablecoin.name}
              balance={stablecoin.smartWalletBalance}
            />
            <label htmlFor="amount">Amount:</label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <br></br>
            <button onClick={sendToEtherspot}>Send to etherspot wallet</button>
            <br></br>
            <button onClick={handleSendToEOA}>Send to eoa</button>
            <br></br>
            <button onClick={handleLockFunds}>Lock fund</button>
          </div>
        ) : null /* Removed <br></br> to prevent hydration issues */
      }
    </div>
  );
};

export default EtherspotInstance;
