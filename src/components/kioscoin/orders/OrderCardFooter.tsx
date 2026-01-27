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
import { useKioscoinUserContext } from "../users/KioscoinUserContext";
import { useAccount } from "wagmi";
import { useKioscoinWallet } from "@/components/web3/AccountAbstraction/KioscoinWalletProvider";
import NotifyFiatSentButton from "../NotifyFiatSentButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  BlockchainName,
  ConfigStore,
  getBlockchainDisplayName,
} from "@/lib/ConfigStore";
import { useWeb3AuthConnect, useWeb3Auth } from "@web3auth/modal/react";
import { LoadingWallet } from "../LoadingWallet";
import { useNavigation } from "../NavigationContext";
import { Filter } from "./OrdersFeed";
import { TakeOrderGuardSheet } from "./TakeOrderGuardSheet";

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
  const { navigate } = useNavigation();
  const { user, isLoggedIn, loginId } = useKioscoinUserContext();
  const { isConnected } = useAccount();
  const { isConnected: isConnectedWeb3Auth } = useWeb3AuthConnect();
  const { status: web3authStatus } = useWeb3Auth();
  const {
    currentChainId,
    isLoading: isEtherspotLoading,
    isReady,
    switchToChain,
  } = useKioscoinWallet();
  const { t } = useTranslation();
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [orderTaken, setOrderTaken] = useState(false);
  const [isTakeGuardOpen, setIsTakeGuardOpen] = useState(false);
  const [taking, setTaking] = useState(false);
  const isSeller: boolean = order.sellerId === user?.id;
  const canSelectOrder = isLoggedIn && user?.id !== order?.creatorId;

  // Check if wallet is connecting
  const walletConnecting =
    web3authStatus === "connecting" ||
    (isConnectedWeb3Auth && (isEtherspotLoading || !isReady));

  const shouldShowSelectButton =
    !order || order.status === ("PENDING" as OrderStatus);

  const fiatSent = async (order: Order) => {
    try {
      const updateRequest: UpdateOrderRequest = {
        status: "FIAT_SENT",
        orderId: order.id ?? "",
      };
      const updatedOrderResponse = await client.updateOrder(updateRequest, {
        Authorization: `Bearer ${loginId}`,
      });
      // Update local state with the response to show the new status immediately
      const updatedOrder = updatedOrderResponse.orders?.[0];
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
      if (onRefresh) {
        onRefresh(); // Call the refresh callback for feed updates
      }
    } catch (error) {
      console.error("Error notifying FIAT sent:", error);
    }
  };

  const takeOrder = async (order: Order) => {
    if (orderTaken) return;
    setTaking(true);

    try {
      let takeOrderRequest: TakeSellOrderRequest | TakeBuyOrderRequest;
      if (order.type === "SELL") {
        takeOrderRequest = {
          type: "SELL",
          orderId: order.id ?? "",
          userId: user?.id ?? "",
          buyerAddress: walletAddress,
          fiatAmount: order.fiatAmount?.toString() ?? "0",
          username: user?.username,
        } as TakeSellOrderRequest;
      } else {
        takeOrderRequest = {
          type: "BUY",
          orderId: order.id ?? "",
          userId: user?.id ?? "",
          amount: order.fiatAmount?.toString() ?? "0",
          username: user?.username,
          paymentMethods: paymentMethods,
        } as TakeBuyOrderRequest;
      }

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
      // Navigate to MyOrders with WAITING_PAYMENT filter and open the taken order details
      const takenOrderId = response.orders?.[0]?.id ?? order.id;
      navigate("MyOrders", {
        filter: Filter.WAITING_PAYMENT,
        orderId: takenOrderId,
        showDetails: true,
      });
      // Only close sheet on success
      setIsTakeGuardOpen(false);
    } catch (error) {
      // Re-throw to let TakeOrderGuardSheet handle the error display
      throw error;
    } finally {
      setTaking(false);
    }
  };

  const renderWrongNetworkAlert = (blockchain: string | undefined) => {
    if (!blockchain) return null;
    const orderChainId = getChainIdFromBlockchain(blockchain);
    const isCorrectChain = currentChainId === orderChainId;
    if (!isCorrectChain) {
      return (
        <Alert
          variant="destructive"
          className="bg-red-50 font-secondary border-none text-left pl-2 text-sm"
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
          <Button
            size="sm"
            variant="outline"
            className="mt-2 w-full border-red-300 text-red-700 hover:bg-red-100"
            onClick={() => switchToChain(orderChainId)}
            disabled={isEtherspotLoading}
          >
            {isEtherspotLoading ? t("loading_status") : t("switch_network")}
          </Button>
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

      if (walletConnecting) {
        return <LoadingWallet />;
      }

      return isConnected || isConnectedWeb3Auth ? (
        <LockFundsButton
          order={order}
          canLock={isSeller}
          onSuccess={() => {}}
          onRefresh={onRefresh}
        />
      ) : (
        <div className="w-full py-2 text-center text-sm text-red-600 font-secondary">
          {t("wallet_connection_error")}
        </div>
      );
    }

    if (order.status === "FIAT_SENT" && isSeller) {
      const wrongNetworkAlert = renderWrongNetworkAlert(order.blockchain);
      if (wrongNetworkAlert) return wrongNetworkAlert;

      if (walletConnecting) {
        return <LoadingWallet />;
      }

      return isConnected || isConnectedWeb3Auth ? (
        <ReleaseFundsButton
          order={order}
          onRefresh={onRefresh}
          canRelease={isSeller}
        />
      ) : (
        <div className="w-full py-2 text-center text-sm text-red-600 font-secondary">
          {t("wallet_connection_error")}
        </div>
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

  // For BUY orders, seller must provide a payment method with both entity and alias
  const hasValidPaymentMethod =
    order.type === "BUY"
      ? paymentMethods.length > 0 &&
        paymentMethods.some(
          (pm) =>
            pm.entity &&
            pm.entity.trim().length > 0 &&
            pm.alias &&
            pm.alias.trim().length > 0
        )
      : true;

  const canTakeBuyOrder = order.type === "BUY" && hasValidPaymentMethod;
  const canTakeSellOrder = order.type === "SELL" && walletAddress;
  const isTakeableStatus = (order.status as OrderStatus) === "PENDING";
  const canTakeOrder =
    isTakeableStatus && (canTakeBuyOrder || canTakeSellOrder);

  return isWaitingAction ? (
    <CardFooter className="pb-0">
      <div className="text-center w-full text-white">
        {renderActionButton()}
      </div>
    </CardFooter>
  ) : orderTaken ? (
    <CardFooter className="pb-0">
      <div className="text-secondary block text-center font-secondary">
        {t("order_taken")}
      </div>
    </CardFooter>
  ) : shouldShowSelectButton && !showDetails && canSelectOrder ? (
    <CardFooter className="pb-0">
      <Button
        className="w-full bg-secondary text-white font-secondary"
        onClick={() => onSelect && onSelect(order)}
      >
        {order.type === "SELL" ? t("buy") : t("sell")} {order.tokenCode}
      </Button>
    </CardFooter>
  ) : showDetails && canTakeOrder && shouldShowSelectButton ? (
    <CardFooter className="pb-0">
      <>
        <Button
          className="w-full bg-secondary text-white font-secondary"
          onClick={() => !orderTaken && setIsTakeGuardOpen(true)}
        >
          {order.type === "BUY"
            ? `${t("sell")} ${order.tokenCode}`
            : `${t("buy")} ${order.tokenCode}`}
        </Button>
        <TakeOrderGuardSheet
          open={isTakeGuardOpen}
          onOpenChange={setIsTakeGuardOpen}
          onConfirm={() => takeOrder(order)}
          order={order}
          action={order.type === "SELL" ? "BUY" : "SELL"}
          loading={taking}
        />
      </>
    </CardFooter>
  ) : showDetails && order.type === "BUY" && !hasValidPaymentMethod ? (
    <CardFooter className="pb-0">
      <div className="w-full py-2 text-center text-sm text-muted-foreground font-secondary">
        {t("select_payment_method_to_continue")}
      </div>
    </CardFooter>
  ) : null;
};

export default OrderCardFooter;
