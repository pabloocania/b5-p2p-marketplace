"use client";
import { useEffect, useMemo, useState } from "react";
import {
  OrderType,
  Order,
  generateSecretAndHash,
  PaymentMethod,
  OrderStatus,
  parseApiError,
} from "b5-api-client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { p2pMarketAPIClient as client } from "../../../../lib/APIClients";
import { useKioscoinUserContext } from "../../users/KioscoinUserContext";
import { useTranslation } from "react-i18next";
import TokenSelector from "@/components/kioscoin/orders/create-orders/TokenSelector";
import BlockchainSelector from "@/components/kioscoin/orders/create-orders/BlockchainSelector";
import OrderTypeSelector from "@/components/kioscoin/orders/create-orders/OrderTypeSelector";
import { ExchangeRatesService } from "@/components/web3/ExchangeRatesService";
import { ScrollableContainer } from "../../ScrollabelContainer";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import UserMenuNew from "../../users/UserMenuNew";
import {
  ConfigStore,
  BlockchainName,
  getBlockchainDisplayName,
} from "@/lib/ConfigStore";
import PaymentMethodsComponent from "./PaymentMethodsComponent";
import { useKioscoinWallet } from "@/components/web3/AccountAbstraction/KioscoinWalletProvider";
import FiatSendReceiveMethodSelector from "../FiatReceiveMethodSelector";
import { cn, formatTokenAmount, parseAmountToBigInt } from "@/lib/utils";
import {
  ValidationErrorAlert,
  ApiError,
} from "@/components/kioscoin/ValidationErrorAlert";

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
  const [tokenCode, setTokenCode] = useState(preFilledData?.tokenCode || "");
  const {
    swAddress,
    balances,
    switchToChain,
    currentChainId,
    isLoading: isEtherspotLoading,
  } = useKioscoinWallet();
  const [walletAddress, setWalletAddress] = useState(swAddress || "");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [blockchain, setBlockchain] = useState(preFilledData?.blockchain || "");

  const [suggestedRate, setSuggestedRate] = useState<number | null>(null);
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [fiatCode, setFiatCode] = useState<"ARS" | "EUR">(
    preFilledData?.fiatCode === "EUR" ? "EUR" : "ARS"
  );
  const [rateError, setRateError] = useState<string | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const { user, isLoggedIn, loginId, login, logout } = useKioscoinUserContext();
  const { t } = useTranslation();
  const availableMethods = useMemo(
    () => ConfigStore.getInstance().getPaymentMethods(),
    []
  );
  const [selectedMethods, setSelectedMethods] = useState(
    user?.settings?.paymentMethods || availableMethods || []
  );
  const [submitError, setSubmitError] = useState<ApiError | null>(null);

  const stablecoinConfig = ConfigStore.getInstance().getBackendStablecoins();

  // Get available blockchains for the selected token
  const availableBlockchains = useMemo(() => {
    return (
      stablecoinConfig?.supportedStablecoins
        ?.filter((sc) => sc.name === tokenCode)
        ?.flatMap((v) => v.addresses) || []
    );
  }, [stablecoinConfig, tokenCode]);

  // Auto-select blockchain when there's only one available
  useEffect(() => {
    if (availableBlockchains.length === 1) {
      setBlockchain(availableBlockchains[0].blockchain);
    } else if (availableBlockchains.length > 1 && !preFilledData?.blockchain) {
      setBlockchain("");
    }
  }, [availableBlockchains, preFilledData?.blockchain]);

  // Check if user is on wrong chain for the selected blockchain
  const selectedChainId = useMemo(() => {
    if (!blockchain) return 0;
    return ConfigStore.getInstance().getChainIdFromBlockchain(blockchain);
  }, [blockchain]);

  const isWrongChain = useMemo(() => {
    return (
      blockchain &&
      selectedChainId !== 0 &&
      currentChainId !== 0 &&
      currentChainId !== selectedChainId
    );
  }, [blockchain, selectedChainId, currentChainId]);

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

  // Calculate total required including 1% fee for SELL orders
  const calculateTotalRequired = (amount: number, decimals: number): bigint => {
    if (amount <= 0) return BigInt(0);
    const amountStr = amount.toFixed(decimals);
    const amountBigInt = parseAmountToBigInt(amountStr, decimals);
    const feeBigInt = amountBigInt / BigInt(100); // 1% fee
    return amountBigInt + feeBigInt;
  };

  // Validate balance for SELL orders (must have amount + 1% fee)
  const balanceValidation = useMemo(() => {
    // Only validate for SELL orders
    if (orderType !== "SELL" || !tokenCode || !blockchain || tokenAmount <= 0) {
      return { isValid: true, error: null, availableBalanceText: null };
    }

    // If on wrong chain, don't show balance error - user will see switch network button
    if (isWrongChain) {
      return { isValid: false, error: null, availableBalanceText: null };
    }

    const tokenBalance = balances.find(
      (b) => b.name.toUpperCase() === tokenCode.toUpperCase()
    );

    console.log("tokenBalance", tokenBalance);
    console.log("bala", balances);
    if (!tokenBalance) {
      return {
        isValid: false,
        error: t("token_balance_not_found") || "Token balance not found",
        availableBalanceText: null,
      };
    }

    const decimals =
      ConfigStore.getInstance().getTokenDecimalsByTokenCodeAndBlockchain(
        tokenCode,
        blockchain
      );
    const totalRequired = calculateTotalRequired(tokenAmount, decimals);
    const availableBalance = BigInt(tokenBalance.smartWalletBalance || "0");

    if (availableBalance < totalRequired) {
      const requiredFormatted = formatTokenAmount(
        totalRequired.toString(),
        decimals
      );
      const availableFormatted = formatTokenAmount(
        availableBalance.toString(),
        decimals
      );

      return {
        isValid: false,
        error: t("insufficient_balance_with_fee", {
          required: requiredFormatted,
          token: tokenCode,
        }),
        availableBalanceText: t("available_balance_error", {
          available: availableFormatted,
          token: tokenCode,
        }),
      };
    }

    return {
      isValid: true,
      error: null,
      availableBalanceText: null,
    };
  }, [
    orderType,
    tokenCode,
    blockchain,
    tokenAmount,
    balances,
    isWrongChain,
    t,
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

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
      const apiError = parseApiError(err);
      setSubmitError({
        message: apiError.message,
        error: apiError.error,
      });
    }
  };

  const isFormComplete = () =>
    selectedMethods.length > 0 &&
    tokenAmount > 0 &&
    blockchain &&
    tokenCode &&
    customRate !== null &&
    balanceValidation.isValid &&
    (orderType === "SELL" || walletAddress);

  return (
    <ScrollableContainer>
      <div className="flex justify-center items-center pt-8">
        {!isLoggedIn ? (
          <Sheet open>
            <SheetContent
              side="bottom"
              className="h-[75vh]"
              closeText={t("close")}
            >
              <UserMenuNew user={user} onLogin={login} onLogout={logout} />
            </SheetContent>
          </Sheet>
        ) : (
          <div className="w-full max-w-4xl mx-auto gap-1">
            {/* Tarjeta 1: Compra/Venta */}
            <Card className="w-full border-l-4 border-primary/80 border border-primary/20 shadow-lg rounded-xl bg-white/90 mb-2">
              <CardContent className="text-primary px-4 py-3 space-y-3 font-secondary">
                <OrderTypeSelector
                  orderType={orderType}
                  onChange={setOrderType}
                />

                {/* Input de cantidad */}
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder={t("enter_amount")}
                    value={tokenAmount === 0 ? "" : tokenAmount}
                    onChange={(e) =>
                      setTokenAmount(parseFloat(e.target.value) || 0)
                    }
                    className={cn(
                      "focus:ring-primary focus:border-primary font-secondary border [&::placeholder]:font-secondary [&::placeholder]:text-xs",
                      orderType === "SELL" && balanceValidation.error
                        ? "border-red-500"
                        : "border-primary/50"
                    )}
                  />
                  {/* Balance error message for SELL orders */}
                  {orderType === "SELL" && balanceValidation.error && (
                    <div className="space-y-1 mt-1">
                      <span className="text-xs text-primary font-secondary block">
                        {balanceValidation.error}
                      </span>
                      {balanceValidation.availableBalanceText && (
                        <span className="text-xs text-primary font-secondary block">
                          {balanceValidation.availableBalanceText}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tarjeta 2: Token y Blockchain */}
            <Card className="w-full border-l-4 border-primary/80 border border-primary/20 shadow-lg rounded-xl bg-white/90 mb-2">
              <CardContent className="text-primary px-4 py-3 space-y-3 font-secondary w-full">
                {/* Token selector */}
                <h3 className="text-dark text-xs">{t("select_token")}</h3>
                <TokenSelector
                  onBlockchainChange={setBlockchain}
                  onTokenChange={setTokenCode}
                  preSelectedBlockchain={blockchain}
                  preSelectedToken={tokenCode}
                />
                {tokenCode && (
                  <>
                    <h3 className="text-dark text-xs">
                      {t("select_blockchain")}
                    </h3>
                    <BlockchainSelector
                      selectedToken={tokenCode}
                      selectedBlockchain={blockchain}
                      availableBlockchains={availableBlockchains}
                      onBlockchainChange={setBlockchain}
                    />
                    {isWrongChain && (
                      <>
                        <h3 className="text-dark text-xs">
                          {t("please_switch_to_network", {
                            network: getBlockchainDisplayName(
                              blockchain as BlockchainName
                            ),
                          })}
                        </h3>
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-secondary w-full items-center gap-2 text-xs border-primary text-dark hover:bg-terciary hover:text-primary"
                          onClick={() => switchToChain(selectedChainId)}
                          disabled={isEtherspotLoading}
                        >
                          {isEtherspotLoading
                            ? t("loading_status")
                            : t("switch_network")}
                        </Button>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tarjeta 3: Tasa de Cambio */}
            <Card className="w-full border-l-4 border-primary/80 border border-primary/20 shadow-lg rounded-xl bg-white/90 mb-2">
              <CardContent className="text-primary px-4 py-3 space-y-3 font-secondary">
                {/* Botones de moneda fiat */}
                <h3 className="text-dark text-xs">{t("select_fiat_code")}</h3>
                <div className="flex gap-2">
                  {(["ARS", "EUR"] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setFiatCode(code)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-xs font-secondary transition ${
                        fiatCode === code
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-gray-300 text-muted-foreground"
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>

                {/* Input de tasa de cambio con sugerencia - ancho limitado */}
                <div className="flex gap-2 items-center">
                  <div className="text-xs text-dark w-2/3 text-right">
                    {t("suggested")}: {fiatCode === "EUR" ? "€" : "$"}
                    {suggestedRate?.toFixed(2) || "..."}
                  </div>
                  <div className="w-1/3">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={customRate !== null ? customRate.toFixed(2) : ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setCustomRate(null);
                          return;
                        }
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          // Round to 2 decimals for consistency
                          setCustomRate(Math.round(numValue * 100) / 100);
                        }
                      }}
                      placeholder="0.00"
                      className="focus:ring-primary focus:border-primary border border-primary text-sm"
                    />
                  </div>
                </div>

                {/* Monto a recibir o pagar */}
                <div className="flex items-right font-bold w-full justify-end">
                  <span className="text-xs font-secondary pr-1">
                    {orderType === "BUY"
                      ? t("you_will_pay")
                      : t("you_will_receive")}
                    :
                  </span>
                  <span className="text-xs font-secondary">
                    {fiatCode === "EUR" ? "€" : "$"}
                    {calculateFiatEquivalent().toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full border-l-4 border-primary/80 border border-primary/20 shadow-lg rounded-xl bg-white/90">
              <form onSubmit={handleSubmit}>
                <CardContent className="text-primary space-y-1 font-secondary px-4 py-3">
                  <FiatSendReceiveMethodSelector
                    availableMethods={availableMethods}
                    userMethods={user?.settings?.paymentMethods ?? []}
                    selectedMethod={selectedMethods[0] ?? null}
                    onMethodSelect={(method) => setSelectedMethods([method])}
                    fiatCode={fiatCode}
                    isBuyOrder={orderType === "BUY"}
                  />
                  {orderType === "BUY" && (
                    <div className="space-y-2 pt-2">
                      <h3 className="text-dark text-xs font-secondary">
                        {t("your_address")}
                      </h3>
                      <Input
                        id="wallet-address"
                        placeholder={t("insert_wallet_address")}
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="focus:ring-primary focus:border-primary font-secondary [&::placeholder]:font-secondary [&::placeholder]:text-xs border border-primary"
                      />
                    </div>
                  )}
                </CardContent>
                {submitError && (
                  <div className="px-4 pb-2">
                    <ValidationErrorAlert error={submitError} />
                  </div>
                )}
                {!createdOrder && (
                  <CardFooter className="px-3 py-2">
                    <Button
                      className="w-full rounded-b-lg text-xs font-semibold shadow-none transition-colors bg-primary text-white hover:bg-primary/90 font-secondary"
                      style={{
                        fontFamily:
                          '"Montserrat", "Inter", system-ui, sans-serif',
                        fontSize: "12px",
                      }}
                      type="submit"
                      disabled={!isFormComplete()}
                    >
                      {orderType === "BUY"
                        ? t("buy_now", {
                            amount: tokenAmount,
                            crypto: tokenCode,
                          })
                        : t("sell_now", {
                            amount: tokenAmount,
                            crypto: tokenCode,
                          })}
                    </Button>
                  </CardFooter>
                )}
              </form>
            </Card>
          </div>
        )}
      </div>
    </ScrollableContainer>
  );
}
