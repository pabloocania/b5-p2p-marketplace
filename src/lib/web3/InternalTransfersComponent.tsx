"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, ArrowLeftRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Stablecoin } from "./types";
import { useEtherspotSdk } from "./EtherspotSdkProvider";
import { useAccount } from "wagmi";

// interface InternalTransfersComponentProps {
//   balances: Stablecoin[];
// }

export default function InternalTransfersComponent() {
  // balances = [],
  const { balances } = useEtherspotSdk();
  const [open, setOpen] = useState(false);
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
    if (!isConnected) {
      setMyWalletBalances({});
      setKioscoinWalletBalances({});
      setSelectedCoin(null);
    }
  }, [isConnected]);

  const handleTransfer = () => {
    if (selectedCoin && transferAmount) {
      const amount = parseFloat(transferAmount);
      if (isNaN(amount) || amount <= 0) return;

      if (activeTab === "myWallet") {
        if (myWalletBalances[selectedCoin.name] >= amount) {
          //   setMyWalletBalances((prev) => ({
          //     ...prev,
          //     [selectedCoin.eoaBalance]: prev[selectedCoin.eoaBalance] - amount,
          //   }));
          //   setKioscoinWalletBalances((prev) => ({
          //     ...prev,
          //     [selectedCoin.eoaBalance]: prev[selectedCoin.eoaBalance] + amount,
          //   }));
        }
      } else {
        if (kioscoinWalletBalances[selectedCoin.name] >= amount) {
          //   setKioscoinWalletBalances((prev) => ({
          //     ...prev,
          //     [selectedCoin.smartWalletBalance]:
          //       prev[selectedCoin.smartWalletBalance] - amount,
          //   }));
          //   setMyWalletBalances((prev) => ({
          //     ...prev,
          //     [selectedCoin.smartWalletBalance]:
          //       prev[selectedCoin.smartWalletBalance] + amount,
          //   }));
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
          <CardTitle className="text-center">Stablecoin Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="myWallet"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <div className="mb-4">
              <select
                className="w-full p-2 border rounded"
                value={selectedCoin ? selectedCoin.name : ""}
                onChange={(e) => {
                  const coin = balances.find(
                    (coin) => coin.name === e.target.value
                  );
                  setSelectedCoin(coin || null);
                }}
              >
                {balances.map((coin) => (
                  <option key={coin.eoaBalance} value={coin.name}>
                    {coin.name}
                  </option>
                ))}
              </select>
            </div>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="myWallet">My Wallet</TabsTrigger>
              <TabsTrigger value="kioscoinWallet">
                My Kioscoin Wallet
              </TabsTrigger>
            </TabsList>
            <TabsContent value="myWallet">
              <BalanceDisplay
                balance={selectedCoin ? myWalletBalances[selectedCoin.name] : 0}
                coin={selectedCoin?.name || ""}
              />
            </TabsContent>
            <TabsContent value="kioscoinWallet">
              <BalanceDisplay
                balance={
                  selectedCoin ? kioscoinWalletBalances[selectedCoin.name] : 0
                }
                coin={selectedCoin?.name || ""}
              />
            </TabsContent>
          </Tabs>
          <div className="mt-4 flex space-x-2">
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
          </div>
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
