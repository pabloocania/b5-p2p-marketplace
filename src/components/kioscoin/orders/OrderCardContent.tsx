// OrderCardContent.tsx
import React, { useEffect, useMemo, useState } from "react";
import { CardContent } from "@/components/ui/card";

// Minimal chat button – removed glow/animations
import {
  KioscoinUser,
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
} from "b5-api-client";
import PaymentMethodDisplay from "../PaymentMethodDisplay";
import { useTranslation } from "react-i18next";
import { SellerText } from "./SellerText";
import { BuyerText } from "./BuyerText";
import AddressInput from "./AddressInput";
import { CryptoAmountIcon } from "../CryptoIcon";
import OrderCreatedDate from "./OrderCreatedDate";
import {
  BlockchainName,
  ConfigStore,
  getBlockchainDisplayName,
} from "@/lib/ConfigStore";
import { Rating } from "../Rating";
import { formatFiatAmount } from "@/lib/utils";
import PaymentMethodSelector from "./create-orders/PaymentMethodSelector";
import FiatReceiveMethodSelector from "./FiatReceiveMethodSelector";

interface OrderCardContentProps {
  order: Order;
  user: KioscoinUser | undefined;
  showDetails: boolean;
  walletAddress: string;
  setWalletAddress: (value: string) => void;
  onPaymentMethodsChange?: (methods: PaymentMethod[]) => void;
}

const finishedStatusesList: OrderStatus[] = [
  "RELEASED",
  "CLOSED",
  "CANCELED",
  "SUCCESS",
  "CANCELED_BY_ADMIN",
  "EXPIRED",
  "COMPLETED_BY_ADMIN",
];

const OrderCardContent: React.FC<OrderCardContentProps> = ({
  order,
  user,
  showDetails,
  walletAddress,
  setWalletAddress,
  onPaymentMethodsChange,
}) => {
  const { t } = useTranslation();
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    PaymentMethod[]
  >([]);
  const availableMethods = ConfigStore.getInstance().getPaymentMethods();

  const hasValidFiatData = (
    order: Order
  ): order is Order & { fiatAmount: string; fiatCode: string } => {
    return (
      typeof order.fiatAmount === "string" && typeof order.fiatCode === "string"
    );
  };

  const isBuyer = order.buyerId === user?.id;
  const isSeller = order.sellerId === user?.id;
  const buyerHasNotRated = isBuyer && !order.buyerHasRated;
  const sellerHasNotRated = isSeller && !order.sellerHasRated;

  const handleUpdatePaymentMethod = (updatedMethods: PaymentMethod[]) => {
    setSelectedPaymentMethods(updatedMethods);
    onPaymentMethodsChange?.(updatedMethods);
  };

  useEffect(() => {
    // Only set payment methods that have valid aliases
    const hasValidAlias = (pm: PaymentMethod) =>
      pm.alias && pm.alias.trim().length > 0;

    if (
      isSeller &&
      user?.settings?.paymentMethods &&
      user.settings.paymentMethods.length > 0
    ) {
      const validMethods = user.settings.paymentMethods.filter(hasValidAlias);
      if (validMethods.length > 0) {
        setSelectedPaymentMethods(validMethods);
      }
    }
  }, [
    order.paymentMethods,
    order.id,
    isSeller,
    user?.settings?.paymentMethods,
  ]);

  const paymentMethodsToDisplay = useMemo(() => {
    if (order.paymentMethods && order.paymentMethods.length > 0) {
      return order.paymentMethods;
    }

    if (selectedPaymentMethods.length > 0) {
      return selectedPaymentMethods;
    }

    return [] as PaymentMethod[];
  }, [order.paymentMethods, selectedPaymentMethods]);

  return (
    <CardContent className="pb-2 mt-2 font-secondary">
      <div className="rounded-lg space-y-1 px-2 bg-secondary bg-opacity-10 space-y-1 pt-1">
        {/* Order header */}
        <div className="flex justify-between items-center w-full text-xl font-bold">
          {/* Order type and amount */}
          <div className="flex space-x-1 items-baseline">
            {/* <span className="text-base text-primary text-lg">
              {order.type === "SELL" ? t("sells") : t("buys")}
            </span> */}
            <span className="flex">
              <CryptoAmountIcon
                formattedAmount={order.amount!!}
                tokenCode={order.tokenCode?.toLowerCase()!!}
                textSizeClass="text-lg text-dark"
              />
            </span>
          </div>
        </div>
        {/* Order details */}
        <div className="flex justify-between w-full pb-1 pt-1 font-secondary">
          <div className="w-1/2 min-w-[60%] flex flex-col space-y-0.5">
            <div className="flex-1">
              <p className="text-left w-full text-primary whitespace-nowrap overflow-hidden text-ellipsis text-sm">
                {t("for")}{" "}
                <span className="text-dark text-sm">
                  {hasValidFiatData(order)
                    ? formatFiatAmount(order.fiatAmount, order.fiatCode)
                    : formatFiatAmount("0", "ARS")}
                </span>
              </p>
            </div>
            <div className="flex-1">
              <p className="text-left w-full text-xs text-primary">
                {t("on")}{" "}
                <span className="font-medium text-dark text-xs">
                  {getBlockchainDisplayName(order.blockchain as BlockchainName)}
                </span>
              </p>
            </div>
            <div className="flex-1">
              {order.sellerId && order.type === "BUY" && (
                <SellerText order={order} userId={user?.id} />
              )}
              {order.buyerId && order.type === "SELL" && (
                <BuyerText order={order} userId={user?.id} />
              )}
            </div>
          </div>
          {/* Payment methods */}
          <div className="text-right">
            {paymentMethodsToDisplay.map((method, index) => (
              <PaymentMethodDisplay key={index} method={method} />
            ))}
          </div>
        </div>
        {/* Order created date */}
        {order.createdAt && (
          <OrderCreatedDate
            createdAt={order.createdAt}
            status={order.status!!}
          />
        )}
      </div>
      {order.status &&
        finishedStatusesList.includes(order.status) &&
        (buyerHasNotRated || sellerHasNotRated) && (
          <Rating
            orderId={order.id!!}
            ratedId={isBuyer ? order.sellerId! : order.buyerId!}
            ratedUsername={
              isBuyer ? "@" + order.sellerUsername! : "@" + order.buyerUsername!
            }
          />
        )}
      {order.status == "PENDING" &&
        user &&
        showDetails &&
        order.type === ("SELL" as OrderType) && (
          <div className="py-2">
            <AddressInput
              walletAddress={walletAddress}
              setWalletAddress={setWalletAddress}
              orderStatus={order.status ? order.status : "CANCELED"}
            />
          </div>
        )}
      {order.status == "PENDING" &&
        user &&
        showDetails &&
        order.type === ("BUY" as OrderType) && (
          <div className="pt-3">
            <FiatReceiveMethodSelector
              availableMethods={availableMethods}
              userMethods={user?.settings?.paymentMethods ?? []}
              selectedMethod={selectedPaymentMethods[0] ?? null}
              onMethodSelect={(method) => handleUpdatePaymentMethod([method])}
              fiatCode={order.fiatCode}
            />
          </div>
        )}
    </CardContent>
  );
};

export default OrderCardContent;
