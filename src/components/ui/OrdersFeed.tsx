import { useEffect, useState } from "react";
import { Order, OrderStatus } from "b5-api-client";
import { OrderCard } from "./OrderCard";
import { ScrollableContainer } from "./ScrollabelContainer";
import { p2pMarketAPIClient as client } from "../../lib/APIClients";
import { useUserContext } from "./UserContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import UserMenu from "./UserMenu";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

export enum Filter {
  ALL = "ALL",
  PENDING = "PENDING",
  WAITING_PAYMENT = "WAITING_PAYMENT",
  CLOSED = "CLOSED",
}

interface OrderFeedProps {
  orderId?: string | undefined;
  status?: string | undefined;
  creatorId?: string | undefined;
  buyerId?: string | undefined;
  filter?: Filter;
  refreshKey?: number;
  refreshInterval?: number;
  resetSelectedOrder?: boolean;
  onBack?: () => void;
  highlightedOrderId?: string;
}

export default function OrdersFeed({
  orderId,
  status,
  creatorId,
  buyerId,
  filter = Filter.ALL,
  refreshKey,
  refreshInterval = 15000,
  resetSelectedOrder,
  onBack,
  highlightedOrderId,
}: OrderFeedProps) {
  const { user, login, logout } = useUserContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(
    undefined
  );
  const { t } = useTranslation();
  const [isLoginSheetOpen, setIsLoginSheetOpen] = useState(false);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      let response;
      const userId = user?.userId || buyerId || creatorId;

      if (orderId) {
        // Buscar todas las órdenes y filtrar solo la que tenga ese ID
        response = await client.getOrders({
          status: [
            "PENDING",
            "WAITING_PAYMENT",
            "ACTIVE",
            "FIAT_SENT",
            "RELEASED",
            "COMPLETED_BY_ADMIN",
          ],
        });

        if (response?.orders) {
          const filtered = response.orders.filter(
            (order) => order.id === orderId
          );
          setOrders(filtered);
        }
        return;
      }

      // Si no hay orderId, mostrar el feed completo según el filtro
      if (filter === Filter.ALL || (!user && filter === Filter.PENDING)) {
        // Mostrar órdenes públicas pendientes
        response = await client.getOrders({ status: ["PENDING"] });
      } else if (user && filter === Filter.PENDING) {
        // Mostrar órdenes del usuario pendientes
        response = await client.getOrders({
          status: ["PENDING"],
          user: userId,
        });
      } else if (filter === Filter.WAITING_PAYMENT) {
        response = await client.getOrders({
          status: ["WAITING_PAYMENT", "ACTIVE", "FIAT_SENT"],
          user: userId,
        });
      } else if (filter === Filter.CLOSED) {
        response = await client.getOrders({
          status: ["RELEASED", "COMPLETED_BY_ADMIN"],
          user: userId,
        });
      }

      if (response) {
        setOrders(response.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    }
  };

  // Escuchar cambios en orderId, filter y user
  useEffect(() => {
    fetchOrders();
  }, [orderId, filter, user]);

  useEffect(() => {
    if (resetSelectedOrder) {
      setSelectedOrder(undefined);
    }
  }, [resetSelectedOrder]);

  // Set up interval for automatic refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchOrders();
    }, refreshInterval);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [filter, refreshInterval, user, creatorId, buyerId, orderId]);

  useEffect(() => {
    if (highlightedOrderId) {
      const highlightedOrder = orders.find(
        (order) => order.id === highlightedOrderId
      );
      if (highlightedOrder) {
        setSelectedOrder(highlightedOrder);
      }
    }
  }, [highlightedOrderId, orders]);

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleBack = () => {
    setSelectedOrder(undefined);
    // Limpiar la URL al cerrar la orden compartida
    if (orderId) {
      router.replace("/", undefined, { shallow: true });
    }
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="w-full h-full">
      <ScrollableContainer>
        {filter === Filter.ALL || filter === Filter.PENDING || user ? (
          selectedOrder ? (
            <OrderCard
              orderDTO={selectedOrder}
              showDetails={true}
              onRefresh={fetchOrders}
            />
          ) : orders && orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className={`mb-7 ${
                  order.id === highlightedOrderId
                    ? "ring-2 ring-primary animate-pulse"
                    : ""
                }`}
              >
                <OrderCard
                  orderDTO={order}
                  onSelect={handleOrderSelect}
                  onRefresh={fetchOrders}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center h-full">
              <div className="mb-5">{t("no_orders_available")}</div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center h-full mt-10">
            <Button
              onClick={() => setIsLoginSheetOpen(true)}
              className="text-white"
            >
              {t("login_to_view")}
            </Button>
            <Sheet open={isLoginSheetOpen} onOpenChange={setIsLoginSheetOpen}>
              <SheetTrigger asChild>
                <div />
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[90vh]"
                closeText={t("close")}
              >
                <VisuallyHidden>
                  <SheetTitle>User Menu Dialog</SheetTitle>
                </VisuallyHidden>
                <UserMenu user={user} onLogin={login} onLogout={logout} />
              </SheetContent>
            </Sheet>
          </div>
        )}
      </ScrollableContainer>
    </div>
  );
}
