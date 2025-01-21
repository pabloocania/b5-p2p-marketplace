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
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

import { Separator } from "@/components/ui/separator";
import { Clipboard, Check, ArrowLeft } from "lucide-react";
import {
  Order,
  OrderType,
  TakeSellOrderRequest,
  TakeBuyOrderRequest,
  UpdateOrderRequest,
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
import { useTranslation } from "react-i18next";
import { Rating } from "./Rating";
import OrderHistory from "./OrderHistory"; // Asegúrate de que la ruta sea correcta

interface OrderCardProps {
  orderDTO: Order | undefined;
  showSelectButton?: boolean;
  onSelect?: (order: Order) => void;
  showDetails?: boolean;
  onBack?: () => void;
  onRefresh?: () => void;
}

export function OrderCard({
  orderDTO,
  showSelectButton = true,
  onSelect,
  showDetails = false,
  onBack,
  onRefresh,
}: OrderCardProps) {
  const { t } = useTranslation();
  const [isButtonVisible, setIsButtonVisible] = useState(showSelectButton);
  const [walletAddress, setWalletAddress] = useState("");
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const [orderTaken, setOrderTaken] = useState(false);
  const [order, setOrder] = useState(orderDTO);
  const { user, isLoggedIn } = useUserContext();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(
    undefined
  );
  const [isIdSheetOpen, setIsIdSheetOpen] = useState(false);

  const handleConnectButton = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  function mapOrderStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      WAITING_PAYMENT: t("waiting_lock"),
      ACTIVE: t("awaiting_buyer"),
      PENDING: t("open"),
      FIAT_SENT: t("waiting_release"),
      // Add other status mappings as needed
      COMPLETED: t("completed"),
      COMPLETED_BY_ADMIN: t("completed"),
      RELEASED: t("completed"),
      CANCELLED: t("canceled"),
      // Add more mappings here
    };
    return statusMap[status] ?? "Unknown";
  }

  const shouldShowSelectButton =
    !order || order.status === ("PENDING" as OrderStatus);

  const canSelectOrder = isLoggedIn && user?.userId !== order?.creatorId;

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

  const finishedStatusesList: OrderStatus[] = [
    "RELEASED",
    "CLOSED",
    "CANCELED",
    "SUCCESS",
    "CANCELED_BY_ADMIN",
    "EXPIRED",
    "COMPLETED_BY_ADMIN",
  ];

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
        return "bg-secondary text-white";
      case "WAITING_PAYMENT":
        return "bg-yellow-500 text-white";
      case "ACTIVE":
        return "bg-yellow-500 text-white";
      case "FIAT_SENT":
        return "bg-yellow-500 text-white";
      case "SUCCESS":
      case "COMPLETED_BY_ADMIN":
      case "RELEASED":
        return "bg-secondary text-white";
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
          <CardTitle>{t("no_orders_available")}</CardTitle>
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

  // Removed duplicate function declaration

  return (
    <Card className="w-full mb-4" variant="shadow">
      <OrderStatusBar status={order.status ?? "Unknown"} />
      <CardHeader>
        <div className="flex-[0_0_75%]">
          <CardTitle>
            {order.type === "SELL" ? (
              <>
                <span className="font-bold">{order.sellerUsername}</span>{" "}
                <span className="font-normal">{t("sells")}</span>{" "}
                <span className="font-bold">
                  {order.amount} {order.tokenCode}
                </span>
              </>
            ) : (
              <>
                <span className="font-bold">{order.buyerUsername}</span>{" "}
                <span className="font-normal">{t("buys")}</span>{" "}
                <span className="font-bold">
                  {order.amount} {order.tokenCode}
                </span>
              </>
            )}
          </CardTitle>
        </div>
        <div className="flex-[0_0_25%] flex justify-end h-6">
          <div className="w-full max-w-full text-right">
            <Badge
              className={`text-xs ${mapOrderVariant(order)} whitespace-normal`}
            >
              {mapOrderStatus(order.status ?? "Unknown")}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6 pt-0 pb-3">
        <div className="space-y-1">
          <div className="pb-0">
            <p>
              {t("for")}{" "}
              <span className="font-bold">${formattedFiatAmount} ARS</span>
            </p>
          </div>
          <div>
            <span className="text-xs block">
              {order.paymentMethods?.map((method, index) => (
                <PaymentMethodDisplay key={index} method={method} />
              ))}
            </span>
          </div>
          {order.buyerId && order.type === "SELL" && (
            <div className="text-xs text-black">
              <div>
                {t("buyer")}:{" "}
                <span className="font-semibold">
                  {order.buyerId === user?.userId
                    ? t("you")
                    : order.buyerUsername
                    ? order.buyerUsername
                    : order.buyerId}
                </span>
              </div>
              {!order.sellerHasRated &&
                order.status &&
                finishedStatusesList.includes(order.status) && (
                  <Rating orderId={order.id!!} ratedId={order.buyerId} />
                )}
            </div>
          )}
          {order.sellerId && order.type === "BUY" && (
            <div>
              <span className="text-xs text-gray-600 block">
                {t("seller")}:{" "}
                {order.sellerId === user?.userId
                  ? t("you")
                  : order.sellerUsername
                  ? order.sellerUsername
                  : order.sellerId}
              </span>
              {!order.buyerHasRated &&
                order.status &&
                finishedStatusesList.includes(order.status) && (
                  <Rating orderId={order.id!!} ratedId={order.sellerId} />
                )}
            </div>
          )}
          {user && showDetails && order.type === ("SELL" as OrderType) && (
            <div className="pt-2">
              <div className="space-y-2">
                <span className="text-xs block font-semibold">
                  {t("take_order_information")}
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
      <CardFooter>
        {shouldHideButtons ? (
          <>
            {order.status === "ACTIVE" && !canLockOrReleaseFunds && (
              <Button
                className="w-full text-white bg-yellow-500"
                onClick={() => {
                  if (!orderTaken) fiatSent(order);
                  onRefresh?.(); // Call the refresh callback
                }}
              >
                {t("notify_fiat_sent")}
              </Button>
            )}
            {order.status === "WAITING_PAYMENT" && (
              <>
                {canLockOrReleaseFunds ? (
                  !isConnected ? (
                    <div className="text-center w-full text-white">
                      <Button
                        className="w-full bg-primary text-white"
                        onClick={handleConnectButton} // Use the handler
                      >
                        {t("connect_to_continue")}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center w-full text-white">
                      <LockFundsButton
                        order={order}
                        canLock={canLockOrReleaseFunds}
                      />
                    </div>
                  )
                ) : null}
              </>
            )}
            {order.status === "FIAT_SENT" && canLockOrReleaseFunds ? (
              !isConnected ? (
                <div className="text-center w-full text-white">
                  <Button
                    className="w-full bg-primary text-white"
                    onClick={handleConnectButton} // Use the handler
                  >
                    {t("connect_to_continue")}
                  </Button>
                </div>
              ) : (
                <div className="text-center w-full text-white">
                  <ReleaseFundsButton
                    order={order}
                    onRefresh={onRefresh}
                    canRelease={canLockOrReleaseFunds}
                  />
                </div>
              )
            ) : null}
          </>
        ) : (
          <>
            {orderTaken ? (
              <div className="text-secondary block text-center font-semibold">
                {t("order_taken")}
              </div>
            ) : (
              <>
                {showSelectButton &&
                  !showDetails &&
                  shouldShowSelectButton &&
                  canSelectOrder && (
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
      <Separator className="mb-2" />
      <div>
        <div className="block text-center pb-1">
          <a
            href="#"
            className="text-blue-500 text-xs underline hover:text-blue-700 cursor-pointer"
            onClick={(e) => {
              e.preventDefault(); // Evita redirección
              setSelectedOrderId && setSelectedOrderId(order.id); // Actualiza el ID seleccionado
              setIsIdSheetOpen(true); // Abre el Sheet
              console.log("Order ID selected:", order.id); // Log para depuración
            }}
          >
            ID: {order.id}
          </a>
        </div>

        {/* Sheet */}
        <Sheet open={isIdSheetOpen} onOpenChange={setIsIdSheetOpen}>
          <SheetContent
            side="bottom"
            className="flex flex-col justify-between rounded-lg" // Added 'rounded-lg' class for rounded corners
            closeText={""}
          >
            {/* Especificamos que salga desde abajo */}
            <div className="p-4 flex-1 overflow-y-auto">
              <SheetTitle className="text-lg font-semibold mb-4">
                ⏰ {t("order_history")}
              </SheetTitle>
              {/* Renderizamos el componente OrderHistory */}
              <OrderHistory orderId={selectedOrderId} />
            </div>

            {/* Footer elevado */}
            <SheetFooter className="p-4 border-t bg-gray-100 rounded-md">
              <button
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                onClick={() => setIsIdSheetOpen(false)}
              >
                {t("close")}
              </button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </Card>
  );
}
