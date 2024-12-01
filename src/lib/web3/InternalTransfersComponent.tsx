"use client";

import { ArrowLeftRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Clipboard } from "lucide-react"; // Import an icon for the clipboard
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { TokenBalance } from "./types";
import { useEtherspotSdk } from "./EtherspotSdkProvider";
import { useAccount } from "wagmi";
import { Label } from "@/components/ui/label";
import { useEtherspotFlow } from "@/hooks/useEtherspotFlow";
import TokenBalanceList from "@/components/ui/TokenBalances";

export default function InternalTransfersComponent() {
  const { t } = useTranslation();
  const { balances, swAddress } = useEtherspotSdk();
  const [selectedCoin, setSelectedCoin] = useState<(typeof balances)[0] | null>(
    null
  );
  const { isConnected, address } = useAccount();
  const [myWalletBalances, setMyWalletBalances] = useState<{
    [key: string]: number;
  }>({});
  const [kioscoinWalletBalances, setKioscoinWalletBalances] = useState<{
    [key: string]: number;
  }>({});
  const [transferAmount, setTransferAmount] = useState("");
  const [activeTab, setActiveTab] = useState("kioscoinWallet");
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const { transferTokensFromEtherspotToEOA, transferFromEOAToSW } =
    useEtherspotFlow();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (balances.length > 0) {
      setSelectedCoin(balances[0]);

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
          try {
            await transferFromEOAToSW(selectedCoin.address, transferAmount);
          } catch (error) {
            console.error("Error transferring from EOA to SW:", error);
          }
        }
      } else {
        if (kioscoinWalletBalances[selectedCoin.name] >= amount) {
          try {
            await transferTokensFromEtherspotToEOA(
              selectedCoin.address,
              transferAmount
            );
          } catch (error) {
            console.error(
              "Error transferring tokens from Etherspot to EOA:",
              error
            );
          }
        }
      }
      setTransferAmount("");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(swAddress).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  const handleTokenSelect = (token: TokenBalance | null) => {
    setSelectedToken(token);
    if (token) {
      const balance =
        activeTab === "myWallet"
          ? myWalletBalances[token.name]
          : kioscoinWalletBalances[token.name];
      setTransferAmount(balance.toString());
    } else {
      setTransferAmount(""); // Reset if no token is selected
    }
  };

  if (!balances) {
    return <div>{t("no_stablecoins_available")}</div>;
  }

  return (
    <div className="flex items-center w-full">
      <Card className="w-full p-2 bg-transparent border border-primary">
        <CardContent>
          <Tabs
            defaultValue="kioscoinWallet"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="kioscoinWallet"
                className={`flex items-center justify-center w-full ${
                  activeTab === "kioscoinWallet"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                <span className="flex items-center">
                  Smart Wallet
                  {/* <span className="ml-2">
                    <InfoToggle content="Your wallet that let you sell and buy gasless!" />
                  </span> */}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="myWallet"
                className={`flex items-center justify-center w-full ${
                  activeTab === "myWallet"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                <span className="flex items-center">EOA Wallet</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="kioscoinWallet">
              <p className="font-bold text-primary">{t("address")}</p>
              <div className="flex items-center space-x-2 pb-4">
                <p className="text-primary text-sm">
                  {swAddress.slice(0, 10)}...{swAddress.slice(-4)}
                </p>
                <button
                  onClick={handleCopy}
                  className={`${
                    isCopied
                      ? "text-secondary"
                      : "text-primary hover:text-blue-600"
                  }`}
                  aria-label="Copy address"
                >
                  <Clipboard className="h-4 w-4" />
                </button>
              </div>
              <p className="font-bold text-primary">Balances</p>
              <TokenBalanceList
                onTokenSelect={handleTokenSelect}
                balances={balances.map((token) => ({
                  ...token,
                  eoaBalance: token.smartWalletBalance, // Use smart wallet balances
                }))}
              />
            </TabsContent>
            <TabsContent value="myWallet">
              <p className="font-bold text-primary">Balances</p>
              <TokenBalanceList
                onTokenSelect={handleTokenSelect}
                balances={balances.map((token) => ({
                  ...token,
                  smartWalletBalance: token.eoaBalance, // Use EOA balances
                }))}
              />
            </TabsContent>
          </Tabs>
          <div className="mt-4 space-y-2">
            {selectedToken && (
              <div className="flex flex-col space-y-2">
                <p className="text-xs text-center">
                  {t("enter_transfer_amount")}
                </p>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="transfer-amount" className="sr-only">
                    {t("transfer_amount")}
                  </Label>
                  <Input
                    id="transfer-amount"
                    type="number"
                    placeholder="Amount"
                    value={transferAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTransferAmount(value);
                    }}
                    className="flex-grow"
                  />
                  <Button onClick={handleMaxAmount} variant="outline" size="sm">
                    Max
                  </Button>
                </div>
                <Button
                  onClick={handleTransfer}
                  className="w-full bg-secondary text-white"
                  disabled={
                    !!selectedCoin &&
                    parseFloat(transferAmount) >
                      (activeTab === "myWallet"
                        ? myWalletBalances[selectedCoin.name]
                        : kioscoinWalletBalances[selectedCoin.name])
                  }
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  {t("transfer")}
                </Button>
              </div>
            )}
            {selectedCoin &&
              parseFloat(transferAmount) >
                (activeTab === "myWallet"
                  ? myWalletBalances[selectedCoin.name]
                  : kioscoinWalletBalances[selectedCoin.name]) && (
                <div className="text-white-500 text-sm mt-1">
                  {t("not_enough_balance")}
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
