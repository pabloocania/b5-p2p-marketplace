"use client";

import { ArrowLeftRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { TokenBalance } from "./types";
import { useEtherspotSdk } from "./EtherspotSdkProvider";
import { useAccount } from "wagmi";
import { Label } from "@/components/ui/label";
import TokenBalanceList from "@/components/ui/TokenBalances";
import { useTransaction } from "./TransactionContext";
import { useTransactionStatusChecker } from "../useTransactionStatusChecker";
import { useTransactionHandler } from "./InternalTransferServices";
import Address from "./Address";

export default function InternalTransfersComponent() {
  const { t } = useTranslation();
  const { setTransaction } = useTransaction();
  const { balances, swAddress, getTokensBalances, primeSdk } =
    useEtherspotSdk();
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
  const { checkTransactionStatus } = useTransactionStatusChecker();
  const { handleTransaction } = useTransactionHandler(
    setTransaction,
    t,
    checkTransactionStatus
  );

  useEffect(() => {
    console.log("balances update");
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
        activeTab === "eoaWallet"
          ? myWalletBalances[selectedCoin.name]
          : kioscoinWalletBalances[selectedCoin.name];

      if (amount > sourceBalance) return;

      const transactionType =
        activeTab === "eoaWallet" ? "EOAToSW" : "EtherspotToEOA";
      await handleTransaction(
        transactionType,
        selectedCoin.address,
        transferAmount
      );

      setTransferAmount("");
    }
  };

  const handleRefresh = async () => {
    if (primeSdk) {
      await getTokensBalances(primeSdk);
    } else {
      console.error("PrimeSdk is not initialized.");
    }
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
      <Card className="w-full bg-transparent border border-primary">
        <CardContent>
          <Tabs
            defaultValue="kioscoinWallet"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2 bg-transparent w-full">
              <TabsTrigger
                value="kioscoinWallet"
                className={`flex items-center justify-center w-full ${
                  activeTab === "kioscoinWallet"
                    ? "text-white"
                    : "text-primary bg-transparent"
                }`}
              >
                <span className="flex items-center text-primary">
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
                    ? "text-white"
                    : "text-primary bg-transparent"
                }`}
              >
                <span className="flex items-center text-primary">
                  EOA Wallet
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="kioscoinWallet">
              {swAddress && (
                <div>
                  <p className="font-bold text-primary">{t("address")}</p>
                  <Address address={swAddress} />
                </div>
              )}
              <div className="flex items-center pb-2">
                <p className="font-bold text-primary mr-2">Balances</p>
                <button
                  onClick={handleRefresh}
                  className="text-primary hover:text-blue-600 transition duration-150 ease-in-out"
                  aria-label="Refresh balances"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <TokenBalanceList
                onTokenSelect={handleTokenSelect}
                balances={balances.map((token) => ({
                  ...token,
                  eoaBalance: token.smartWalletBalance, // Use smart wallet balances
                }))}
              />
            </TabsContent>
            <TabsContent value="myWallet">
              {address && (
                <div>
                  <p className="font-bold text-primary">{t("address")}</p>
                  <Address address={address} />
                </div>
              )}
              <div className="flex items-center pb-2">
                <p className="font-bold text-primary mr-2">Balances</p>
                <button
                  onClick={handleRefresh}
                  className="text-primary hover:text-blue-600 transition duration-150 ease-in-out"
                  aria-label="Refresh balances"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
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
