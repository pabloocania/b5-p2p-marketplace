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
  OrderStatus,
  UpdateOrderRequest,
} from "ba-api-client";
import { bolsilloArgentoAPIClient as client } from "../../lib/APIClients";
import { useUserContext } from "./UserContext";

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
      return "text-green-700";
    case "LOCKED":
      return "text-red-700";
    case "WAITING_FOR_PAYMENT":
      return "text-yellow-700";
    case "PENDING":
      return "text-orange-700";
    default:
      return "text-gray-700";
  }
}

const lockFunds = async (order: Order) => {
  await client.testLockFunds(order);
};

const releaseFunds = async (order: Order) => {
  await client.testReleaseFunds(order);
};

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
      console.log("FIAT sent notification successful");
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
        } as TakeSellOrderRequest;
      } else {
        takeOrderRequest = {
          type: "BUY",
          orderId: order.id ?? "",
          userId: user?.userId ?? "", // Replace with the actual user ID
          amount: order.fiatAmount?.toString() ?? "0",
          username: user?.username,
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

  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row justify-between items-center py-3">
        {showDetails && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <CardTitle>
          {order.amount} {order.tokenCode ?? ""}
        </CardTitle>
        <div className="pb-2">
          <Badge
            variant={order.type === "BUY" ? "default" : "destructive"}
            className="text-sm"
          >
            {order.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="mb-2" />
        <div className="space-y-1">
          <div>
            <span className="text-sm font-semibold block">
              Equivalent in ARS: ${order.fiatAmount}
            </span>
          </div>
          <div>
            <span className="text-sm font-semibold block">
              Status:{" "}
              <span className={getStatusColor(order.status ?? "")}>
                {order.status ?? "Unknown"}
              </span>
            </span>
          </div>
          <div className="pb-2">
            <span className="text-sm font-semibold block">
              Payment Method:{" "}
              {order.paymentMethod?.map((method) => method.type).join(", ")}
            </span>
          </div>
          <Separator className="mb-4" />
          <div>
            <span className="text-xs text-gray-600 block">ID: {order.id}</span>
          </div>
          <div>
            <span className="text-xs text-gray-600 block">
              Creator:{" "}
              {order.creatorId === user?.userId
                ? "You"
                : !order.creatorId
                ? order.type == "BUY"
                  ? order?.buyerUsername
                  : order?.sellerUsername
                : order.creatorId}
            </span>
          </div>
          {order.buyerId && order.type === "SELL" && (
            <div>
              <span className="text-xs text-gray-600 block">
                Buyer:{" "}
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
              <Separator className="mb-4" />
              <div className="space-y-2">
                <span className="text-xs text-gray-900 block">
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
        <div className="bg-red-100 text-red-700 p-4 text-center">
          {order.status === "ACTIVE" ? (
            canLockOrReleaseFunds ? (
              <div className="bg-yellow-100 text-yellow-700 p-4 text-center">
                Waiting for the buyer to send FIAT...
              </div>
            ) : (
              <Button
                className="w-full bg-orange-700 text-white"
                onClick={() => {
                  if (!orderTaken) fiatSent(order);
                  onRefresh?.(); // Call the refresh callback
                }}
              >
                Notify FIAT sent
              </Button>
            )
          ) : order.status === ("WAITING_PAYMENT" as OrderStatus) ? (
            canLockOrReleaseFunds ? (
              <Button
                className="w-full bg-blue-700 text-white"
                onClick={() => {
                  lockFunds(order);
                  onRefresh?.(); // Call the refresh callback
                }}
              >
                Lock funds
              </Button>
            ) : (
              <div className="bg-yellow-100 text-yellow-700 p-4 text-center">
                Waiting for the seller to lock the funds to proceed.
              </div>
            )
          ) : order.status === "FIAT_SENT" ? (
            canLockOrReleaseFunds ? (
              <Button
                className="w-full bg-blue-700 text-white"
                onClick={() => {
                  releaseFunds(order);
                  onRefresh?.(); // Call the refresh callback
                }}
              >
                Release Funds
              </Button>
            ) : (
              <div className="bg-yellow-100 text-yellow-700 p-4 text-center">
                Waiting for the buyer to send FIAT...
              </div>
            )
          ) : (
            <div></div>
          )}
        </div>
      ) : (
        <CardFooter>
          {showSelectButton &&
            !showDetails &&
            shouldShowSelectButton &&
            canSelectOrder && (
              <Button
                className="w-full"
                onClick={() => onSelect && onSelect(order)}
              >
                Select
              </Button>
            )}
          {showDetails && (walletAddress || order.type === "BUY") && (
            <Button
              className="w-full bg-green-700 text-white"
              onClick={() => !orderTaken && takeOrder(order)}
            >
              {orderTaken ? "✅ Order taken successfully!" : "Take"}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
