// OrderCardFooter.tsx
import React, { useState } from "react";
import { CardFooter } from "@/components/ui/card";
import {
  Order,
  OrderStatus,
  TakeBuyOrderRequest,
  TakeSellOrderRequest,
  UpdateOrderRequest,
  KioscoinUser,
  PaymentMethod,
} from "b5-api-client";
import { Button } from "@/components/ui/button";
import LockFundsButton from "@/components/web3/Escrow/LockFundsButton";
import ReleaseFundsButton from "@/components/web3/Escrow/ReleaseFundsButton";
import { p2pMarketAPIClient as client } from "../../../lib/APIClients";
import { useTranslation } from "react-i18next";
import { useUserContext } from "../users/UserContext";
import { useAccount, useChainId } from "wagmi";
import { ConnectToContinueButton } from "./ConnectToContinueButton";
import NotifyFiatSentButton from "../NotifyFiatSentButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  BlockchainName,
  ConfigStore,
  getBlockchainDisplayName,
} from "@/lib/ConfigStore";
import DisputeOrderButton from "@/components/kioscoin/dispute/DisputeOrderButton";
import { useWeb3AuthConnect } from "@web3auth/modal/react";

interface OrderCardFooterProps {
  order: Order;
  user: KioscoinUser | undefined;
  walletAddress: string;
  onRefresh?: () => void;
  showDetails: boolean;
  onSelect?: (order: Order) => void;
  setOrder: (order: Order) => void;
  paymentMethods: PaymentMethod[];
}

const OrderCardFooter: React.FC<OrderCardFooterProps> = ({
  order,
  walletAddress,
  onRefresh,
  showDetails,
  onSelect,
  setOrder,
  paymentMethods,
}) => {
  const { user, isLoggedIn, loginId } = useUserContext();
  const { isConnected } = useAccount();
  const { isConnected: isConnectedWeb3Auth } = useWeb3AuthConnect();
  const chainId = useChainId();
  const { t } = useTranslation();
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [orderTaken, setOrderTaken] = useState(false);
  const isSeller: boolean = order.sellerId === user?.id;
  const canSelectOrder = isLoggedIn && user?.id !== order?.creatorId;

  const shouldShowSelectButton =
    !order || order.status === ("PENDING" as OrderStatus);

  const fiatSent = async (order: Order) => {
    try {
      const updateRequest: UpdateOrderRequest = {
        status: "FIAT_SENT",
        orderId: order.id ?? "",
      };
      await client.updateOrder(updateRequest, {
        Authorization: `Bearer ${loginId}`,
      });
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
          userId: user?.id ?? "",
          buyerAddress: walletAddress,
          fiatAmount: order.fiatAmount?.toString() ?? "0",
          username: user?.username,
          hash: order.buyerHash,
        } as TakeSellOrderRequest;
      } else {
        takeOrderRequest = {
          type: "BUY",
          orderId: order.id ?? "",
          userId: user?.id ?? "",
          amount: order.fiatAmount?.toString() ?? "0",
          username: user?.username,
          hash: order.sellerHash,
          paymentMethods: paymentMethods,
        } as TakeBuyOrderRequest;
      }

      console.log("takeOrderRequest", takeOrderRequest);

      const response = await client.takeOrder(takeOrderRequest, {
        Authorization: `Bearer ${loginId}`,
      });
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

  const renderWrongNetworkAlert = (blockchain: string | undefined) => {
    if (!blockchain) return null;
    const orderChainId = getChainIdFromBlockchain(blockchain);
    const isCorrectChain = chainId === orderChainId;
    if (!isCorrectChain) {
      return (
        <Alert
          variant="destructive"
          className="bg-red-50 border-none text-left pl-2 text-sm"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">
            {t("wrong_network")}
          </AlertTitle>
          <AlertDescription className="text-xs">
            {t("please_switch_to_network", {
              network: getBlockchainDisplayName(blockchain as BlockchainName),
            })}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
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
      const wrongNetworkAlert = renderWrongNetworkAlert(order.blockchain);
      if (wrongNetworkAlert) return wrongNetworkAlert;

      return isConnected || isConnectedWeb3Auth ? (
        <LockFundsButton
          order={order}
          canLock={isSeller}
          onSuccess={() => {}}
        />
      ) : (
        <ConnectToContinueButton />
      );
    }

    if (order.status === "FIAT_SENT" && isSeller) {
      const wrongNetworkAlert = renderWrongNetworkAlert(order.blockchain);
      if (wrongNetworkAlert) return wrongNetworkAlert;

      return isConnected || isConnectedWeb3Auth ? (
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

  // Helper function to convert blockchain name to chain ID using ConfigStore
  const getChainIdFromBlockchain = (blockchain: string | undefined): number => {
    return ConfigStore.getInstance().getChainIdFromBlockchain(blockchain);
  };

  const isUserInvolved = [
    order.creatorId,
    order.buyerId,
    order.sellerId,
  ].includes(user?.id);

  const isWaitingAction =
    ["WAITING_PAYMENT", "ACTIVE", "FIAT_SENT"].includes(
      order.status as OrderStatus
    ) && isUserInvolved;

  return isWaitingAction ? (
    <CardFooter className="pb-3">
      <div className="text-center w-full text-white">
        {renderActionButton()}
      </div>
    </CardFooter>
  ) : orderTaken ? (
    <CardFooter className="pb-3">
      <div className="text-secondary block text-center font-semibold">
        {t("order_taken")}
      </div>
    </CardFooter>
  ) : shouldShowSelectButton && !showDetails && canSelectOrder ? (
    <CardFooter className="pb-3">
      <Button
        className="w-full bg-secondary text-white font-semibold"
        onClick={() => onSelect && onSelect(order)}
      >
        {order.type === "SELL" ? t("buy") : t("sell")} {order.tokenCode}
      </Button>
    </CardFooter>
  ) : showDetails && (walletAddress || order.type === "BUY") ? (
    <CardFooter className="pb-3">
      <Button
        className="w-full bg-secondary text-white font-semibold"
        onClick={() => !orderTaken && takeOrder(order)}
      >
        {order.type === "BUY"
          ? `${t("sell")} ${order.tokenCode}`
          : `${t("buy")} ${order.tokenCode}`}
      </Button>
    </CardFooter>
  ) : null;
};

export default OrderCardFooter;
