"use client";

import { ArrowLeftRight, Loader2 } from "lucide-react";
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
import TransferAmountInput from "./TransferComponent";
import { ConfigStore } from "../ConfigStore";
import { parseUnits } from "viem";

export default function InternalTransfersComponent() {
  const { t } = useTranslation();
  const { setTransaction } = useTransaction();
  const { balances, swAddress, getTokensBalances, primeSdk } =
    useEtherspotSdk();
  const { isConnected, address } = useAccount();
  const [myWalletBalances, setMyWalletBalances] = useState<{
    [key: string]: number;
  }>({});
  const [kioscoinWalletBalances, setKioscoinWalletBalances] = useState<{
    [key: string]: number;
  }>({});

  const [activeTab, setActiveTab] = useState("kioscoinWallet");
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const { checkTransactionStatus } = useTransactionStatusChecker();
  const { handleTransaction } = useTransactionHandler(
    setTransaction,
    t,
    checkTransactionStatus
  );

  useEffect(() => {
    if (balances.length > 0) {
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
    }
  }, [isConnected]);

  const handleTransfer = async (transferAmount: string) => {
    if (selectedToken) {
      const amount = parseFloat(transferAmount);
      if (isNaN(amount) || amount <= 0) return;

      // Get stablecoins from ConfigStore
      const stablecoins =
        ConfigStore.getInstance().getBackendStablecoins()
          ?.supportedStablecoins || [];
      const tokenInfo = stablecoins.find((stablecoin) =>
        stablecoin.addresses.some(
          (addr) =>
            addr.address.toLowerCase() === selectedToken.address.toLowerCase()
        )
      );
      console.log("tokenInfo", tokenInfo);
      const tokenDecimals =
        tokenInfo?.name === "USDC" || tokenInfo?.name === "USDT" ? 6 : 18;

      // Use parseUnits instead of formatUnits to convert to wei
      const formattedAmount = parseUnits(
        transferAmount,
        tokenDecimals
      ).toString();
      console.log("formattedAmount", formattedAmount);
      const sourceBalance =
        activeTab === "myWallet"
          ? parseFloat(selectedToken.eoaBalance)
          : parseFloat(selectedToken.smartWalletBalance);

      if (amount > sourceBalance) return;

      const transactionType =
        activeTab === "myWallet" ? "EOAToSW" : "EtherspotToEOA";
      await handleTransaction(
        transactionType,
        selectedToken.address,
        formattedAmount
      );
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
  };

  if (!balances) {
    return <div>{t("no_stablecoins_available")}</div>;
  }

  return (
    <div className="flex flex-col items-center w-full rounded-lg px-1 bg-white space-y-1 py-1">
      <Tabs
        defaultValue="kioscoinWallet"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 bg-secondary bg-opacity-10">
          <TabsTrigger
            value="kioscoinWallet"
            className={`flex items-center justify-center w-full ${
              activeTab === "kioscoinWallet"
                ? "border border-secondary bg-primary"
                : "text-primary bg-transparent"
            }`}
          >
            <span className="flex items-center text-primary font-bold">
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
                ? "border border-secondary bg-primary"
                : "text-primary bg-transparent"
            }`}
          >
            <span className="flex items-center text-primary font-bold">
              EOA Wallet
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="kioscoinWallet"
          className="px-2 bg-secondary bg-opacity-10 rounded-lg py-2 space-y-2"
        >
          {swAddress && (
            <div className="space-y-1">
              <p className="font-bold text-primary text-sm">{t("address")}</p>
              <Address address={swAddress} />
            </div>
          )}
          <div className="flex items-center">
            <p className="font-bold text-primary text-sm">Balances</p>
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
            balanceType="sw"
            balances={balances}
          />
        </TabsContent>
        <TabsContent
          value="myWallet"
          className="px-2 bg-secondary bg-opacity-10 rounded-lg py-2 space-y-2"
        >
          {address && (
            <div className="space-y-1">
              <p className="font-bold text-primary text-sm">{t("address")}</p>
              <Address address={address} />
            </div>
          )}
          <div className="flex items-center">
            <p className="font-bold text-primary text-sm">Balances</p>
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
            balanceType="eoa"
            balances={balances}
          />
        </TabsContent>
      </Tabs>
      {/* <Card className="w-full bg-white border border-primary border-opacity-10">
        <CardContent>
        </CardContent>
      </Card> */}
      {selectedToken && (
        <div className="bg-secondary bg-opacity-10 rounded-lg flex flex-col space-y-2 w-full p-2">
          <TransferAmountInput
            selectedToken={selectedToken}
            handleTransfer={handleTransfer}
            isEOA={activeTab === "myWallet"}
          />
          {/* {selectedToken && (
          <div className="flex flex-col space-y-2">
            <p className="text-xs text-center">{t("enter_transfer_amount")}</p>
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
        )} */}
          {/* {selectedToken &&
          parseFloat(transferAmount) >
            (activeTab === "myWallet"
              ? myWalletBalances[selectedCoin.name]
              : kioscoinWalletBalances[selectedCoin.name]) && (
            <div className="text-white-500 text-sm mt-1">
              {t("not_enough_balance")}
            </div>
          )} */}
        </div>
      )}
    </div>
  );
}
