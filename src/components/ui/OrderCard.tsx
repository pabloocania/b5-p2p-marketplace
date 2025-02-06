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
import { Order } from "b5-api-client";
import { useUserContext } from "./UserContext";
import OrderStatusBar from "./OrderStatus";
import { useTranslation } from "react-i18next";
import OrderCardHeader from "./OrderCardHeader";
import OrderCardContent from "./OrderCardContent";
import OrderCardFooter from "./OrderCardFooter";
import OrderIdLink from "./OrderIdLink";
import OrderCreatedDate from "../OrderCreatedDate";

interface OrderCardProps {
  orderDTO: Order | undefined;
  onSelect?: (order: Order) => void;
  showDetails?: boolean;
  onRefresh?: () => void;
}

export function OrderCard({
  orderDTO,
  onSelect,
  showDetails = false,
  onRefresh,
}: OrderCardProps) {
  const { t } = useTranslation();
  const [walletAddress, setWalletAddress] = useState("");
  const [order, setOrder] = useState(orderDTO);
  const { user, isLoggedIn } = useUserContext();

  useEffect(() => {
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
      <OrderCardHeader order={order}></OrderCardHeader>
      <OrderCardContent
        order={order}
        user={user}
        walletAddress={walletAddress}
        showDetails={showDetails}
        setWalletAddress={setWalletAddress}
      ></OrderCardContent>
      <OrderCardFooter
        order={order}
        user={user}
        onRefresh={onRefresh}
        onSelect={onSelect}
        walletAddress={walletAddress}
        showDetails={showDetails}
        setOrder={setOrder}
      ></OrderCardFooter>
      <Separator className="mb-0" />
      <div className="pl-4 pr-4 flex items-center justify-between text-[11px] whitespace-nowrap overflow-hidden">
        <div className="flex-1 truncate max-w-[50%]">
          <OrderIdLink orderId={order.id} className="truncate max-w-[100px]" />
        </div>
        <div className="flex items-center gap-3 opacity-90">
          {order.createdAt && <OrderCreatedDate createdAt={order.createdAt} />}
        </div>
      </div>
    </Card>
  );
}
