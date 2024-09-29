"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { TokenBalance } from "./types";
import { useEtherspotSdk } from "./EtherspotSdkProvider";
import { useAccount } from "wagmi";
import { Label } from "@/components/ui/label";
import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";

export default function InternalTransfersComponent() {
  // balances = [],
  const { balances } = useEtherspotSdk();
  const [selectedCoin, setSelectedCoin] = useState<(typeof balances)[0] | null>(
    null
  );
  const { isConnected } = useAccount();
  const [myWalletBalances, setMyWalletBalances] = useState<{
    [key: string]: number;
  }>({});
  const [kioscoinWalletBalances, setKioscoinWalletBalances] = useState<{
    [key: string]: number;
  }>({});
  const [transferAmount, setTransferAmount] = useState("");
  const [activeTab, setActiveTab] = useState("myWallet");
  const { transferTokensFromEtherspotToEOA, transferTokensToEtherspotWallet } =
    useEtherspotFlow();

  useEffect(() => {
    if (balances.length > 0) {
      setSelectedCoin(balances[0]);

      //   const initialBalances = stablecoins.reduce((acc, coin) => {
      //     acc[coin.] = coin.balance;
      //     return acc;
      const initialBalances = balances.reduce((acc, coin) => {
        acc[coin.name] = Number(coin.eoaBalance);
        return acc;
      }, {} as { [key: string]: number });

      const initialBalancesKioscoin = balances.reduce((acc, coin) => {
        acc[coin.name] = Number(coin.smartWalletBalance);
        return acc;
      }, {} as { [key: string]: number });

      setMyWalletBalances(initialBalances);
      setKioscoinWalletBalances(initialBalancesKioscoin);
    }
  }, [balances]);

  useEffect(() => {
    setTransferAmount("");
  }, [activeTab]);

  useEffect(() => {
    if (!isConnected) {
      setMyWalletBalances({});
      setKioscoinWalletBalances({});
      setSelectedCoin(null);
    }
  }, [isConnected]);

  const handleMaxAmount = () => {
    if (selectedCoin) {
      const maxAmount =
        activeTab === "myWallet"
          ? myWalletBalances[selectedCoin.name]
          : kioscoinWalletBalances[selectedCoin.name];
      setTransferAmount(maxAmount.toString());
    }
  };

  function CoinSelector({
    balances,
    selectedCoin,
    onSelectCoin,
  }: {
    balances: TokenBalance[];
    selectedCoin: TokenBalance | null;
    onSelectCoin: (coin: TokenBalance | null) => void;
  }) {
    return (
      <div className="mb-4">
        <select
          className="w-full p-2 border rounded"
          value={selectedCoin ? selectedCoin.name : ""}
          onChange={(e) => {
            const coin = balances.find((coin) => coin.name === e.target.value);
            onSelectCoin(coin || null);
          }}
        >
          {balances.map((coin) => (
            <option key={coin.eoaBalance} value={coin.name}>
              {coin.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const handleTransfer = async () => {
    if (selectedCoin && transferAmount) {
      const amount = parseFloat(transferAmount);
      if (isNaN(amount) || amount <= 0) return;
      const sourceBalance =
        activeTab === "myWallet"
          ? myWalletBalances[selectedCoin.name]
          : kioscoinWalletBalances[selectedCoin.name];

      if (amount > sourceBalance) return; // Prevent transfer if amount exceeds balance

      if (activeTab === "myWallet") {
        if (myWalletBalances[selectedCoin.name] >= amount) {
          await transferTokensToEtherspotWallet(
            selectedCoin.address,
            transferAmount
          );
        }
      } else {
        if (kioscoinWalletBalances[selectedCoin.name] >= amount) {
          await transferTokensFromEtherspotToEOA(
            selectedCoin.address,
            transferAmount
          );
        }
      }
      setTransferAmount("");
    }
  };

  if (!balances) {
    return <div>No stablecoins available</div>;
  }

  return (
    <div className="flex items-center bg-gray-100 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Account Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="myWallet"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="myWallet">My Wallet</TabsTrigger>
              <TabsTrigger value="kioscoinWallet">
                My Kioscoin Wallet
              </TabsTrigger>
            </TabsList>
            <TabsContent value="myWallet">
              <CoinSelector
                balances={balances}
                selectedCoin={selectedCoin}
                onSelectCoin={setSelectedCoin}
              />
              <BalanceDisplay
                balance={selectedCoin ? myWalletBalances[selectedCoin.name] : 0}
                coin={selectedCoin?.name || ""}
              />
            </TabsContent>
            <TabsContent value="kioscoinWallet">
              <CoinSelector
                balances={balances}
                selectedCoin={selectedCoin}
                onSelectCoin={setSelectedCoin}
              />
              <BalanceDisplay
                balance={
                  selectedCoin ? kioscoinWalletBalances[selectedCoin.name] : 0
                }
                coin={selectedCoin?.name || ""}
              />
            </TabsContent>
          </Tabs>
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="transfer-amount" className="sr-only">
                Transfer Amount
              </Label>
              <Input
                id="transfer-amount"
                type="number"
                placeholder="Amount to transfer"
                value={transferAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue) && selectedCoin) {
                    const maxBalance =
                      activeTab === "myWallet"
                        ? myWalletBalances[selectedCoin.name]
                        : kioscoinWalletBalances[selectedCoin.name];
                    setTransferAmount(
                      Math.min(numValue, maxBalance).toString()
                    );
                  } else {
                    setTransferAmount(value);
                  }
                }}
                className="flex-grow"
              />
              <Button onClick={handleMaxAmount} variant="outline" size="sm">
                Max
              </Button>
            </div>
            <Button onClick={handleTransfer} className="w-full">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Transfer
            </Button>
          </div>
          {/* <div className="mt-4 flex space-x-2">
            <Input
              type="number"
              placeholder={
                activeTab === "myWallet"
                  ? "Transfer to Kioscoin"
                  : "Transfer to My Wallet"
              }
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleTransfer}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Transfer
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}

function BalanceDisplay({ balance, coin }: { balance: number; coin: string }) {
  return (
    <div className="mt-4 text-center">
      <p className="text-sm text-gray-500">Current Balance</p>
      <p className="text-3xl font-bold mt-2">${balance.toFixed(2)}</p>
    </div>
  );
}
