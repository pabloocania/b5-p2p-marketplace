import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clipboard, Check, ArrowLeft } from "lucide-react";
import {
  Order,
  OrderType,
  TakeSellOrderRequest,
  TakeBuyOrderRequest,
  UpdateOrderRequest,
  generateSecretAndHash,
  OrderStatus,
  PaymentMethod,
} from "b5-api-client";
import { p2pMarketAPIClient as client } from "../../lib/APIClients";
import { useUserContext } from "./UserContext";
import LockFundsButton from "@/lib/web3/LockFundsButton";
import ReleaseFundsButton from "@/lib/web3/ReleaseFundsButton";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import PaymentMethodDisplay from "./PaymentMethodDisplay";
import OrderStatusBar from "./OrderStatus";

interface OrderCardProps {
  orderDTO: Order | undefined;
  showSelectButton?: boolean;
  onSelect?: (order: Order) => void;
  showDetails?: boolean;
  onBack?: () => void;
  onRefresh?: () => void;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "text-purple-700";
    case "FIAT_SENT":
      return "text-red-700";
    case "WAITING_PAYMENT":
      return "text-yellow-700";
    case "PENDING":
      return "text-blue-700";
    default:
      return "text-green-700";
  }
}

export function OrderCard({
  orderDTO,
  showSelectButton = true,
  onSelect,
  showDetails = false,
  onBack,
  onRefresh,
}: OrderCardProps) {
  const [isButtonVisible, setIsButtonVisible] = useState(showSelectButton);
  const [walletAddress, setWalletAddress] = useState("");
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const [orderTaken, setOrderTaken] = useState(false);
  const [order, setOrder] = useState(orderDTO);
  const { user } = useUserContext();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const releaseFunds = async (order: Order) => {
    await client.testReleaseFunds(order);
  };

  const handleConnectButton = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  function mapOrderStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      WAITING_PAYMENT: "Awaiting lock",
      ACTIVE: "Awaiting buyer",
      PENDING: "Open",
      FIAT_SENT: "Awaiting release",
      // Add other status mappings as needed
      COMPLETED: "Completed",
      COMPLETED_BY_ADMIN: "Completed",
      RELEASED: "Completed",
      CANCELLED: "Cancelled",
      // Add more mappings here
    };
    return statusMap[status] ?? "Unknown";
  }

  const shouldShowSelectButton =
    !order || order.status === ("PENDING" as OrderStatus);

  const canSelectOrder = user?.userId !== order?.creatorId;

  useEffect(() => {
    setClipboardSupported("clipboard" in navigator);
    setOrder(orderDTO);
  }, [orderDTO]);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setWalletAddress(text);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

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

  function mapOrderVariant(order: Order): string {
    switch (order.status) {
      case "PENDING":
        return "bg-green-500 text-white";
      case "WAITING_PAYMENT":
        return "bg-red-500 text-white";
      case "ACTIVE":
        return "bg-purple-500 text-white";
      case "FIAT_SENT":
        return "bg-blue-500 text-white";
      case "SUCCESS":
      case "COMPLETED_BY_ADMIN":
      case "RELEASED":
        return "bg-green-500 text-white";
      case "CANCELED":
      case "CANCELED_BY_ADMIN":
        return "bg-gray-300 text-black";
      case "DISPUTE":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  }

  function mapPaymentMethod(methodType: PaymentMethod): JSX.Element {
    const paymentMethodMap: { [key: string]: string } = {
      MERCADO_PAGO: "Fintech",
      FINTECH: "Fintech",
      BANK: "Bank transfer",
      // Add more mappings here
    };

    const methodDescription =
      paymentMethodMap[methodType.type] ?? "Unknown Method";
    const entity = methodType.entity ? (
      <strong>{methodType.entity}</strong>
    ) : null;
    const alias = methodType.alias ? <strong>{methodType.alias}</strong> : null;

    return (
      <>
        {methodDescription} {entity} {alias}
      </>
    );
  }

  if (!order) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Orders</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const isCreator = order.creatorId === user?.userId;
  const isBuyer = order.buyerId === user?.userId;
  const isSeller: boolean = order.sellerId === user?.userId;
  const canLockOrReleaseFunds =
    (isCreator && order.type === "SELL") || (isSeller && order.type === "BUY");
  const shouldHideButtons =
    ["WAITING_PAYMENT", "ACTIVE", "FIAT_SENT"].includes(
      order.status as OrderStatus
    ) &&
    (isCreator || isBuyer || isSeller);
  const formattedFiatAmount = order.fiatAmount
    ? parseFloat(order.fiatAmount).toFixed(2)
    : order.fiatAmount;

  return (
    <Card className="w-full mb-4 border border-black">
      <OrderStatusBar status={order.status ?? "Unknown"} />
      <CardHeader className="flex flex-row justify-between items-center py-3">
        {showDetails && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <CardTitle>
          {order.type === "SELL" ? (
            <>
              <span className="font-bold">{order.sellerUsername}</span>{" "}
              <span className="font-normal">sells</span> <br />
              <span className="font-bold">
                {order.amount} {order.tokenCode}
              </span>
            </>
          ) : (
            <>
              <span className="font-bold">{order.buyerUsername}</span>{" "}
              <span className="font-normal">buys</span> <br />
              <span className="font-bold">
                {order.amount} {order.tokenCode}
              </span>
            </>
          )}
        </CardTitle>
        <div className="px-2">
          <Badge
            variant={"outline"}
            className={`text-xs border border-black  ${mapOrderVariant(order)}`}
          >
            {mapOrderStatus(order.status ?? "Unknown")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-6 pt-0 pb-3">
        <div className="space-y-1">
          <div className="pb-2">
            <p>
              For <span className="font-bold">${formattedFiatAmount} ARS</span>
            </p>
          </div>
          <div>
            <span className="text-sm block font-semibold">
              {order.paymentMethods?.map((method, index) => (
                <PaymentMethodDisplay key={index} method={method} />
              ))}
            </span>
          </div>
          {order.buyerId && order.type === "SELL" && (
            <div className="text-sm text-black">
              Buyer:{" "}
              <span className="font-semibold">
                {order.buyerId === user?.userId
                  ? "You"
                  : order.buyerUsername
                  ? order.buyerUsername
                  : order.buyerId}
              </span>
            </div>
          )}
          {order.sellerId && order.type === "BUY" && (
            <div>
              <span className="text-xs text-gray-600 block">
                Seller:{" "}
                {order.sellerId === user?.userId
                  ? "You"
                  : order.sellerUsername
                  ? order.sellerUsername
                  : order.sellerId}
              </span>
            </div>
          )}
          {user && showDetails && order.type === ("SELL" as OrderType) && (
            <div className="pt-2">
              <div className="space-y-2">
                <span className="text-xs block font-semibold">
                  To take this order, insert the address where you want to
                  receve the funds
                </span>
                <div className="flex space-x-2">
                  <Input
                    id="walletAddress"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter wallet address"
                    className="flex-grow"
                    disabled={order.status !== "PENDING"}
                  />
                  {clipboardSupported && (
                    <Button
                      onClick={handlePasteClipboard}
                      variant="outline"
                      size="icon"
                      title="Paste from clipboard"
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {shouldHideButtons ? (
        <>
          {order.status === "ACTIVE" && !canLockOrReleaseFunds && (
            <div className="text-red-700 p-2 text-center">
              <Button
                className="w-full bg-orange-700 text-white border border-black"
                onClick={() => {
                  if (!orderTaken) fiatSent(order);
                  onRefresh?.(); // Call the refresh callback
                }}
              >
                Notify FIAT sent
              </Button>
            </div>
          )}
          {order.status === "WAITING_PAYMENT" && (
            <>
              {!isConnected ? (
                <div className="text-red-700 p-2 text-center">
                  <Button
                    className="p-4 text-center w-full border border-black"
                    variant="outline"
                    onClick={handleConnectButton} // Use the handler
                  >
                    Connect your wallet to proceed
                  </Button>
                </div>
              ) : canLockOrReleaseFunds ? (
                <div className="px-3 pb-2">
                  <LockFundsButton
                    order={order}
                    canLock={canLockOrReleaseFunds}
                  />
                </div>
              ) : null}
            </>
          )}
          {order.status === "FIAT_SENT" && canLockOrReleaseFunds && (
            <div className="text-red-700 p-2 text-center">
              <ReleaseFundsButton
                order={order}
                onRefresh={onRefresh}
                canRelease={canLockOrReleaseFunds}
              />
            </div>
          )}
        </>
      ) : (
        <CardFooter>
          {orderTaken ? (
            <div className="text-green-700 block text-center font-semibold">
              Order taken successfully!
            </div>
          ) : (
            <>
              {showSelectButton &&
                !showDetails &&
                shouldShowSelectButton &&
                canSelectOrder && (
                  <Button
                    className="w-full bg-green-500 border border-black text-white"
                    variant="outline"
                    onClick={() => onSelect && onSelect(order)}
                  >
                    {order.type === "SELL" ? "Buy" : "Sell"}
                  </Button>
                )}
              {showDetails && (walletAddress || order.type === "BUY") && (
                <Button
                  className="w-full bg-green-500 text-white border border-black"
                  onClick={() => !orderTaken && takeOrder(order)}
                >
                  Take
                </Button>
              )}
            </>
          )}
        </CardFooter>
      )}
      <Separator className="mb-2" />
      <div className="block text-center pb-1">
        <p className="text-xs text-gray-600 block">ID: {order.id}</p>
        {/* <span className="text-xs text-gray-600 block">ID: {order.id}</span> */}
      </div>
    </Card>
  );
}
