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

  useEffect(() => {
    setClipboardSupported("clipboard" in navigator);
    setOrder(orderDTO);
  }, [orderDTO]);

  if (!order) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("no_orders_available")}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

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
            {order.status !== "PENDING" && (
              <Badge className="text-xs whitespace-normal">
                {t("status")}: {t(mapOrderStatus(order.status ?? "Unknown"))}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6 pt-0 pb-3">
        <div className="space-y-1">
          <div className="pb-0">
            <p>
              {t("for")}{" "}
              <span className="font-bold">${order.fiatAmount} ARS</span>
            </p>
          </div>
          <div>
            <span className="text-xs block">
              {order.paymentMethods?.map((method, index) => (
                <PaymentMethodDisplay key={index} method={method} />
              ))}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border border-gray-300 rounded-md flex justify-start items-start h-8 pl-2 pr-4 pt-1">
        <p className="text-xs text-gray-600">
          <a
            href="#"
            className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
            onClick={(e) => {
              e.preventDefault(); // Evita redirección
              console.log("Clicked on ID: ", order.id);
            }}
          >
            ID: {order.id}
          </a>
        </p>
      </CardFooter>

      <Separator className="mb-2" />
    </Card>
  );
}

function mapOrderStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    WAITING_PAYMENT: "waiting_lock",
    ACTIVE: "awaiting_buyer",
    PENDING: "open",
    FIAT_SENT: "waiting_release",
    COMPLETED: "completed",
    COMPLETED_BY_ADMIN: "completed",
    RELEASED: "completed",
    CANCELLED: "canceled",
  };
  return statusMap[status] ?? "Unknown";
}
