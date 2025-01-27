// OrderCardFooter.tsx
import React, { useState } from "react";
import { CardFooter } from "@/components/ui/card";
import {
  Order,
  OrderStatus,
  TakeBuyOrderRequest,
  TakeSellOrderRequest,
  UpdateOrderRequest,
} from "b5-api-client";
import { Button } from "@/components/ui/button";
import LockFundsButton from "@/lib/web3/LockFundsButton";
import ReleaseFundsButton from "@/lib/web3/ReleaseFundsButton";
import { p2pMarketAPIClient as client } from "../../lib/APIClients";
import { useTranslation } from "react-i18next";
import { useUserContext } from "./UserContext";
import { useAccount } from "wagmi";
import { UserProps } from "@/lib/useUser";
import { ConnectToContinueButton } from "./ConnectToContinueButton";
import NotifyFiatSentButton from "./NotifyFiatSentButton";

interface OrderCardFooterProps {
  order: Order;
  user: UserProps | undefined;
  walletAddress: string;
  onRefresh?: () => void;
  showDetails: boolean;
  onSelect?: (order: Order) => void;
  setOrder: (order: Order) => void;
}

const OrderCardFooter: React.FC<OrderCardFooterProps> = ({
  order,
  walletAddress,
  onRefresh,
  showDetails,
  onSelect,
  setOrder,
}) => {
  const { user, isLoggedIn } = useUserContext();
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [orderTaken, setOrderTaken] = useState(false);
  const isSeller: boolean = order.sellerId === user?.userId;
  const canSelectOrder = isLoggedIn && user?.userId !== order?.creatorId;

  const shouldShowSelectButton =
    !order || order.status === ("PENDING" as OrderStatus);

  const fiatSent = async (order: Order) => {
    try {
      const updateRequest: UpdateOrderRequest = {
        status: "FIAT_SENT",
        orderId: order.id ?? "",
      };
      await client.updateOrder(updateRequest);
      if (onRefresh) {
        onRefresh(); // Call the refresh callback
      }
    } catch (error) {
      console.error("Error notifying FIAT sent:", error);
    }
  };

  const takeOrder = async (order: Order) => {
    try {
      if (orderTaken) return;
      let takeOrderRequest: TakeSellOrderRequest | TakeBuyOrderRequest;
      if (order.type === "SELL") {
        takeOrderRequest = {
          type: "SELL",
          orderId: order.id ?? "",
          userId: user?.userId ?? "",
          buyerAddress: walletAddress,
          fiatAmount: order.fiatAmount?.toString() ?? "0",
          username: user?.username,
          hash: order.buyerHash,
        } as TakeSellOrderRequest;
      } else {
        takeOrderRequest = {
          type: "BUY",
          orderId: order.id ?? "",
          userId: user?.userId ?? "", // Replace with the actual user ID
          amount: order.fiatAmount?.toString() ?? "0",
          username: user?.username,
          hash: order.sellerHash,
        } as TakeBuyOrderRequest;
      }

      const response = await client.takeOrder(takeOrderRequest);
      setOrderTaken(true);
      setIsButtonVisible(false);
      if (response.orders.length == 1) {
        setOrder(response.orders[0]);
      }
      if (onRefresh) {
        onRefresh(); // Call the refresh callback
      }
    } catch (error) {
      console.error("Failed to take order:", error);
    }
  };

  const renderActionButton = () => {
    if (order.status === "ACTIVE" && !isSeller) {
      return (
        <NotifyFiatSentButton
          order={order}
          orderTaken={orderTaken}
          onRefresh={onRefresh}
          fiatSent={fiatSent}
        />
      );
    }

    if (order.status === "WAITING_PAYMENT" && isSeller) {
      return isConnected ? (
        <LockFundsButton order={order} canLock={isSeller} />
      ) : (
        <ConnectToContinueButton />
      );
    }

    if (order.status === "FIAT_SENT" && isSeller) {
      return isConnected ? (
        <ReleaseFundsButton
          order={order}
          onRefresh={onRefresh}
          canRelease={isSeller}
        />
      ) : (
        <ConnectToContinueButton />
      );
    }

    return null;
  };

  const isUserInvolved = [
    order.creatorId,
    order.buyerId,
    order.sellerId,
  ].includes(user?.userId);
  const shouldHideButtons =
    ["WAITING_PAYMENT", "ACTIVE", "FIAT_SENT"].includes(
      order.status as OrderStatus
    ) && isUserInvolved;

  return (
    <CardFooter>
      {shouldHideButtons ? (
        <div className="text-center w-full text-white">
          {renderActionButton()}
        </div>
      ) : (
        <>
          {orderTaken ? (
            <div className="text-secondary block text-center font-semibold">
              {t("order_taken")}
            </div>
          ) : (
            <>
              {shouldShowSelectButton && !showDetails && canSelectOrder && (
                <Button
                  className="w-full bg-secondary text-white font-semibold"
                  onClick={() => onSelect && onSelect(order)}
                >
                  {order.type === "SELL" ? t("buy") : t("sell")}
                </Button>
              )}
              {showDetails && (walletAddress || order.type === "BUY") && (
                <Button
                  className="w-full bg-secondary text-white font-semibold"
                  onClick={() => !orderTaken && takeOrder(order)}
                >
                  {t("take_order")}
                </Button>
              )}
            </>
          )}
        </>
      )}
    </CardFooter>
  );
};

export default OrderCardFooter;
