"use client";
import { useEffect, useState } from "react";
import {
  CreateOrderRequest,
  OrderType,
  Order,
  generateSecretAndHash,
  PaymentMethod,
} from "b5-api-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { p2pMarketAPIClient as client } from "../../../lib/APIClients";
import { useUserContext } from "../users/UserContext";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useTranslation } from "react-i18next";
import TokenSelector from "@/components/kioscoin/orders/TokenSelector";
import { ExchangeRatesService } from "@/components/web3/ExchangeRatesService";
import { ScrollableContainer } from "../ScrollabelContainer";
import CompactPaymentMethodSelector from "./CompactPaymentMethodSelector";

interface CreateOrderProps {
  onClose: () => void;
  onConnectWallet: () => void; // Add this prop
}

export default function CreateOrder({
  onClose,
  onConnectWallet,
}: CreateOrderProps) {
  const [orderType, setOrderType] = useState<OrderType>("SELL");
  const [description, setDescription] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [tokenCode, setTokenCode] = useState<string>("PDOC");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const { user, isLoggedIn, loginId } = useUserContext();
  const { openConnectModal } = useConnectModal();
  const { t } = useTranslation();
  const [blockchain, setBlockchain] = useState<string>("");
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const [suggestedRate, setSuggestedRate] = useState<number | null>(null);
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [fiatCode, setFiatCode] = useState<"ARS" | "EUR">("ARS");
  const [rateError, setRateError] = useState<string | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

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
          setRateError(null);
        } else {
          // Handle case where rate is explicitly null (e.g., not found after retries)
          setRateError(
            t("no_rate_available", { token: tokenCode, currency: fiatCode })
          );
        }
      } catch (error) {
        console.error("Error fetching suggested rate via service:", error);
        let errorMessage = t("failed_to_fetch_rate");
        if (error instanceof Error) {
          if (error.message.startsWith("Unsupported token")) {
            errorMessage = t("unsupported_token", { token: tokenCode });
            setSuggestedRate(1);
            setCustomRate(1);
          } else if (error.message.startsWith("CoinGecko API error")) {
            errorMessage = t("coingecko_api_error", {
              error: error.message.replace("CoinGecko API error: ", ""),
            });
          } else if (
            error.message === "Failed to fetch rate after multiple attempts"
          ) {
            errorMessage = t("failed_to_fetch_rate"); // Use the specific translation
          }
          // Keep the original error message for other unexpected errors if desired
          // errorMessage = error.message;
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
    return Math.round(tokenAmount * customRate * 100) / 100; // Redondear a 2 decimales
  };

  const handleOrderTypeChange = (value: string) => {
    setOrderType(value as OrderType);
  };

  const handleConnectButton = () => {
    if (openConnectModal) {
      openConnectModal();
    }
    onConnectWallet();
  };

  const handleBlockchainChange = (blockchain: string) => {
    setBlockchain(blockchain);
  };

  const handleTokenChange = (tokenCode: string) => {
    setTokenCode(tokenCode);
  };

  const handleFiatCodeChange = (value: "ARS" | "EUR") => {
    setFiatCode(value);
  };

  const handleToggle = (method: PaymentMethod) => {
    setSelectedMethods((prev) =>
      prev.some((m) => m.entity === method.entity)
        ? prev.filter((m) => m.entity !== method.entity)
        : [...prev, method]
    );
  };

  const handleUpdateMethod = (updatedMethod: PaymentMethod) => {
    // Create a new immutable array with the updated method
    const updatedSelectedMethods = selectedMethods.map((method) =>
      method.entity === updatedMethod.entity ? { ...updatedMethod } : method
    );

    setSelectedMethods(updatedSelectedMethods);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { secret: secretSeller } = generateSecretAndHash();
    const { secret: secretBuyer } = generateSecretAndHash();

    const newOrder: CreateOrderRequest = {
      type: orderType,
      description,
      amount: tokenAmount.toString(),
      tokenCode,
      fiatAmount: calculateFiatEquivalent().toString(),
      fiatCode: fiatCode,
      walletAddress: orderType === "BUY" ? walletAddress : undefined,
      paymentMethods: selectedMethods,
      creatorId: user?.id,
      status: "PENDING",
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

  const isFormComplete = () => {
    return (
      selectedMethods.length > 0 &&
      tokenAmount > 0 &&
      blockchain !== "" &&
      tokenCode !== "" &&
      customRate !== null &&
      (orderType === "SELL" || walletAddress)
    );
  };

  return (
    <ScrollableContainer>
      <div className="flex justify-center items-center pt-8">
        <Card className="w-full max-w-md border border-primary border-opacity-20">
          <CardHeader className="flex justify-center items-center">
            <CardTitle className="text-center text-primary">
              {t("create_order")}
            </CardTitle>
          </CardHeader>
          <Separator className="my-2"></Separator>
          <CardContent className="text-primary">
            {!isLoggedIn ? (
              <Button
                className="p-4 text-center w-full text-white"
                onClick={handleConnectButton} // Use the handler
              >
                {t("connect_to_continue")}
              </Button>
            ) : createdOrder ? null : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <Label className="font-bold">{t("i_want_to")}</Label>
                  <div>
                    <RadioGroup
                      id="order_type"
                      value={orderType}
                      onValueChange={handleOrderTypeChange}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="sell" value="SELL" />
                        <Label htmlFor="sell">{t("sell")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id="buy" value="BUY" />
                        <Label htmlFor="buy">{t("buy")}</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* <BlockchainSelector
                    onBlockchainChange={handleBlockchainChange}
                    onCoinChange={handleCoinChange}
                  /> */}
                    <TokenSelector
                      onBlockchainChange={handleBlockchainChange}
                      onTokenChange={handleTokenChange}
                    />
                  </div>
                  {blockchain !== "" && tokenCode !== "" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="token-amount"
                          type="number"
                          placeholder={t("enter_amount")}
                          value={tokenAmount === 0 ? "" : tokenAmount}
                          onChange={(e) => {
                            const value = e.target.value;
                            setTokenAmount(
                              value === "" ? 0 : parseFloat(value) || 0
                            );
                          }}
                        />
                      </div>

                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">
                            {t("i_want_to_receive_in")}
                          </Label>
                          <RadioGroup
                            value={fiatCode}
                            onValueChange={handleFiatCodeChange}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem id="ars" value="ARS" />
                              <Label htmlFor="ars">ARS</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem id="eur" value="EUR" />
                              <Label htmlFor="eur">EUR</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="bg-secondary bg-opacity-10 p-2 rounded-md">
                          <Label className="text-xs font-semibold">
                            {t("suggested_rate")}
                          </Label>
                          <div className="text-sm font-medium">
                            1 {tokenCode} = {fiatCode === "EUR" ? "€" : "$"}{" "}
                            {suggestedRate !== null
                              ? suggestedRate.toLocaleString("es-AR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : "Loading..."}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <Label
                            htmlFor="custom-rate"
                            className="text-xs font-semibold flex items-center gap-2"
                          >
                            {t("your_rate")}
                            {isLoadingRate && (
                              <span className="text-secondary">
                                {t("loading_rate")}
                              </span>
                            )}
                          </Label>
                          <Input
                            id="custom-rate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={customRate || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                setCustomRate(null);
                                return;
                              }

                              const numValue = parseFloat(value);
                              if (!isNaN(numValue) && numValue >= 0) {
                                const roundedValue =
                                  Math.round(numValue * 100) / 100;
                                setCustomRate(roundedValue);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "e" || e.key === "-") {
                                e.preventDefault();
                              }
                            }}
                            className={`mt-1 ${
                              customRate === null ? "border-red-500" : ""
                            }`}
                            placeholder={t("enter_amount")}
                          />
                          {(customRate === null || rateError) && (
                            <span className="text-xs text-primary mt-1 block">
                              {rateError || t("rate_must_be_positive")}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-end space-x-1">
                    <Label className="text-md font-semibold">
                      {t("receive_in")}
                    </Label>
                    <div className="text-md font-semibold">
                      {calculateFiatEquivalent().toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {fiatCode === "EUR" ? "€" : "$"}:
                    </div>
                  </div>
                  <CompactPaymentMethodSelector
                    selectedMethods={selectedMethods}
                    onToggle={handleToggle}
                    onUpdateMethod={handleUpdateMethod}
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
                      />
                    </div>
                  )}
                </div>
              </form>
            )}
          </CardContent>
          {!createdOrder && (
            <CardFooter className="py-2 mx-4">
              <Button
                className="w-full text-white bg-secondary"
                onClick={handleSubmit}
                disabled={!isFormComplete()}
              >
                {t("create_order")}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </ScrollableContainer>
  );
}
