"use client";
import { useEffect, useState } from "react";
import {
  CreateOrderRequest,
  OrderType,
  Order,
  generateSecretAndHash,
  PaymentMethod,
  OrderStatus,
} from "b5-api-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { p2pMarketAPIClient as client } from "../../../../lib/APIClients";
import { useUserContext } from "../../users/UserContext";
import { useTranslation } from "react-i18next";
import TokenSelector from "@/components/kioscoin/orders/create-orders/TokenSelector";
import BlockchainSelector from "@/components/kioscoin/orders/create-orders/BlockchainSelector";
import FiatRateSelector from "@/components/kioscoin/orders/create-orders/FiatRateSelector";
import OrderTypeSelector from "@/components/kioscoin/orders/create-orders/OrderTypeSelector";
import PaymentMethodSelector from "@/components/kioscoin/orders/create-orders/PaymentMethodSelector";
import { ExchangeRatesService } from "@/components/web3/ExchangeRatesService";
import { ScrollableContainer } from "../../ScrollabelContainer";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import UserMenuNew from "../../users/UserMenuNew";
import { ConfigStore } from "@/lib/ConfigStore";
import SuggestedRateCard from "@/components/kioscoin/orders/create-orders/SuggestedRateCard";

export default function CreateOrder({
  onClose,
  onConnectWallet,
  preFilledData,
}: {
  onClose: () => void;
  onConnectWallet: () => void;
  preFilledData: {
    fiatCode: string;
    paymentMethods: PaymentMethod[];
    type?: OrderType;
    description?: string;
    amount?: string;
    tokenCode?: string;
    blockchain?: string;
  };
}) {
  const [orderType, setOrderType] = useState(preFilledData?.type || "SELL");
  const [description, setDescription] = useState(
    preFilledData?.description || ""
  );
  const [tokenAmount, setTokenAmount] = useState(
    preFilledData?.amount ? parseFloat(preFilledData.amount) : 0
  );
  const [tokenCode, setTokenCode] = useState(
    preFilledData?.tokenCode || "PDOC"
  );
  const [walletAddress, setWalletAddress] = useState("");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [blockchain, setBlockchain] = useState(preFilledData?.blockchain || "");
  const [selectedMethods, setSelectedMethods] = useState(
    preFilledData?.paymentMethods || []
  );
  const [suggestedRate, setSuggestedRate] = useState<number | null>(null);
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [fiatCode, setFiatCode] = useState<"ARS" | "EUR">(
    preFilledData?.fiatCode === "EUR" ? "EUR" : "ARS"
  );
  const [rateError, setRateError] = useState<string | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const { user, isLoggedIn, loginId, login, logout } = useUserContext();
  const { t } = useTranslation();

  const stablecoinConfig = ConfigStore.getInstance().getBackendStablecoins();

  useEffect(() => {
    const fetchRate = async () => {
      if (!tokenCode || !fiatCode) return;
      setIsLoadingRate(true);
      setRateError(null);
      setSuggestedRate(null);
      setCustomRate(null);

      try {
        const rate = await ExchangeRatesService.fetchRateWithRetry(
          tokenCode,
          fiatCode
        );
        if (rate !== null) {
          setSuggestedRate(rate);
          setCustomRate(rate);
        } else {
          setRateError(
            t("no_rate_available", { token: tokenCode, currency: fiatCode })
          );
        }
      } catch (error) {
        console.error("Error fetching rate:", error);
        let errorMessage = t("failed_to_fetch_rate");
        if (
          error instanceof Error &&
          error.message.startsWith("Unsupported token")
        ) {
          errorMessage = t("unsupported_token", { token: tokenCode });
          setSuggestedRate(1);
          setCustomRate(1);
        }
        setRateError(errorMessage);
      } finally {
        setIsLoadingRate(false);
      }
    };

    fetchRate();
  }, [tokenCode, fiatCode, t]);

  const calculateFiatEquivalent = () => {
    if (customRate === null || tokenAmount === 0) return 0;
    return Math.round(tokenAmount * customRate * 100) / 100;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { secret: secretSeller } = generateSecretAndHash();
    const { secret: secretBuyer } = generateSecretAndHash();

    const newOrder = {
      type: orderType,
      description,
      amount: tokenAmount.toString(),
      tokenCode,
      fiatAmount: calculateFiatEquivalent().toString(),
      fiatCode,
      walletAddress: orderType === "BUY" ? walletAddress : undefined,
      paymentMethods: selectedMethods,
      creatorId: user?.id,
      status: "PENDING" as OrderStatus,
      creatorUsername: user?.username,
      sellerHash: secretSeller.toString("hex"),
      buyerHash: secretBuyer.toString("hex"),
    };

    try {
      const ordersResponse = await client.createOrder(newOrder, {
        "Content-Type": "application/json",
        "x-blockchain": blockchain,
        Authorization: `Bearer ${loginId}`,
      });

      if (ordersResponse.orders.length === 1) {
        setCreatedOrder(ordersResponse.orders[0]);
        onClose();
      }
    } catch (err) {
      console.error("Failed to create order:", err);
      alert("Failed to create order: " + err);
    }
  };

  const isFormComplete = () =>
    selectedMethods.length > 0 &&
    tokenAmount > 0 &&
    blockchain &&
    tokenCode &&
    customRate !== null &&
    (orderType === "SELL" || walletAddress);

  return (
    <ScrollableContainer>
      <div className="flex justify-center items-center pt-8">
        {!isLoggedIn ? (
          <Sheet open>
            <SheetContent
              side="bottom"
              className="h-[90vh]"
              closeText={t("close")}
            >
              <UserMenuNew user={user} onLogin={login} onLogout={logout} />
            </SheetContent>
          </Sheet>
        ) : (
          <Card className="w-full max-w-md border-l-4 border-primary/80 border border-primary/20 shadow-lg rounded-xl bg-white/90">
            <CardHeader className="flex justify-center items-center pb-2">
              <CardTitle className="text-center text-primary text-2xl font-bold">
                {t("create_order")}
              </CardTitle>
            </CardHeader>
            <Separator className="mb-2" />
            <form onSubmit={handleSubmit}>
              <CardContent className="text-primary px-0 py-2 space-y-2">
                <div className="space-y-2 px-4">
                  <OrderTypeSelector
                    orderType={orderType}
                    onChange={setOrderType}
                  />

                  {/* Input de cantidad debajo de los botones de tipo de orden */}
                  <Input
                    type="number"
                    placeholder={t("enter_amount")}
                    value={tokenAmount === 0 ? "" : tokenAmount}
                    onChange={(e) =>
                      setTokenAmount(parseFloat(e.target.value) || 0)
                    }
                    className="focus:ring-primary focus:border-primary"
                  />

                  {/* Token selector con rate sugerido al lado */}
                  <div className="flex justify-between items-end gap-2">
                    <TokenSelector
                      onBlockchainChange={setBlockchain}
                      onTokenChange={setTokenCode}
                      preSelectedBlockchain={blockchain}
                      preSelectedToken={tokenCode}
                    />
                    <SuggestedRateCard
                      tokenCode={tokenCode}
                      fiatCode={fiatCode}
                      suggestedRate={suggestedRate}
                    />
                  </div>

                  {/* BlockchainSelector alineado sin Card extra */}
                  <BlockchainSelector
                    selectedToken={tokenCode}
                    selectedBlockchain={blockchain}
                    availableBlockchains={
                      stablecoinConfig?.supportedStablecoins
                        ?.filter((sc) => sc.name === tokenCode)
                        ?.flatMap((v) => v.addresses) || []
                    }
                    onBlockchainChange={setBlockchain}
                  />

                  <FiatRateSelector
                    fiatCode={fiatCode}
                    setFiatCode={setFiatCode}
                    suggestedRate={suggestedRate}
                    customRate={customRate}
                    isLoadingRate={isLoadingRate}
                    rateError={rateError}
                    onCustomRateChange={setCustomRate}
                    tokenCode={tokenCode}
                  />

                  <div className="flex items-center justify-end space-x-1">
                    <Label className="text-md font-semibold">
                      {t("receive_in")}
                    </Label>
                    <div className="text-md font-semibold">
                      {calculateFiatEquivalent().toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {fiatCode === "EUR" ? "€" : "$"}
                    </div>
                  </div>

                  <PaymentMethodSelector
                    selectedMethods={selectedMethods}
                    onChange={setSelectedMethods}
                  />

                  {orderType === "BUY" && (
                    <div>
                      <Label className="font-bold" htmlFor="wallet-address">
                        {t("address")}
                      </Label>
                      <Input
                        id="wallet-address"
                        placeholder={t("insert_wallet_address")}
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="focus:ring-primary focus:border-primary"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              {!createdOrder && (
                <CardFooter className="p-0">
                  <Button
                    className="w-full rounded-b-xl text-lg font-semibold shadow-none transition-colors bg-primary text-white hover:bg-primary/90"
                    type="submit"
                    disabled={!isFormComplete()}
                  >
                    {orderType === "BUY"
                      ? t("buy_now", { amount: tokenAmount, crypto: tokenCode })
                      : t("sell_now", {
                          amount: tokenAmount,
                          crypto: tokenCode,
                        })}
                  </Button>
                </CardFooter>
              )}
            </form>
          </Card>
        )}
      </div>
    </ScrollableContainer>
  );
}
