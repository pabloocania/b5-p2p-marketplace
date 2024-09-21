import { useEffect, useState } from "react";
import { Order, OrderStatus } from "ba-api-client";
import { OrderCard } from "./OrderCard";
import { ScrollableContainer } from "./ScrollabelContainer";
import { bolsilloArgentoAPIClient as client } from "../../lib/APIClients";
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
  refreshKey?: number; // Add refreshKey prop
  refreshInterval?: number; // Add refreshInterval prop
  resetSelectedOrder?: boolean; // Add resetSelectedOrder prop
  onBack?: () => void; // Add onBack prop
}

export default function OrdersFeed({
  orderId,
  status,
  creatorId,
  buyerId,
  filter = Filter.ALL,
  refreshKey,
  refreshInterval = 60000,
  resetSelectedOrder,
  onBack,
}: OrderFeedProps) {
  const { user, login, logout } = useUserContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(
    undefined
  );
  const [isLoginSheetOpen, setIsLoginSheetOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      let response;
      const userId = user?.userId || buyerId || creatorId;

      if (filter === Filter.ALL) {
        response = await client.getOrders({ status: [Filter.PENDING] });
      } else if (filter === Filter.PENDING) {
        response = await client.getOrders({
          status: [Filter.PENDING],
          user: userId,
        });
      } else if (filter === Filter.WAITING_PAYMENT) {
        response = await client.getOrders({
          status: [
            "WAITING_PAYMENT" as OrderStatus,
            "ACTIVE",
            "FIAT_SENT",
            "RELEASED",
          ],
          user: userId,
        });
        // const buyerOrdersList = response?.orders || [];
        // return buyerOrdersList;
      } else if (filter === Filter.CLOSED) {
        response = await client.getOrders({
          status: ["RELEASED", "COMPLETED_BY_ADMIN"],
          user: userId,
        });
      }

      if (response) {
        setOrders(response.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  useEffect(() => {
    if (resetSelectedOrder) {
      setSelectedOrder(undefined);
    }
  }, [resetSelectedOrder]);

  useEffect(() => {
    if (filter === Filter.ALL || user) {
      fetchOrders();
    }
  }, [user, creatorId, buyerId, filter, refreshKey]);

  // Clear orders when user logs out
  useEffect(() => {
    if (!user) {
      setOrders([]);
    }
  }, [user]);

  // Set up interval for automatic refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchOrders();
    }, refreshInterval);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [filter, refreshInterval, user, creatorId, buyerId]);

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleBack = () => {
    setSelectedOrder(undefined);
    if (onBack) {
      onBack(); // Call the onBack function if provided
    }
  };

  return (
    <div className="w-full h-full">
      <ScrollableContainer>
        {filter === Filter.ALL || user ? (
          selectedOrder ? (
            <OrderCard
              orderDTO={selectedOrder}
              showDetails={true}
              onBack={handleBack}
              onRefresh={refreshOrders}
            />
          ) : orders && orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="mb-5">
                <OrderCard
                  orderDTO={order}
                  onSelect={handleOrderSelect}
                  onRefresh={refreshOrders}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center h-full">
              <div className="mb-5">No orders available</div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center h-full">
            <Button onClick={() => setIsLoginSheetOpen(true)}>
              Login to view your orders
            </Button>
            <Sheet open={isLoginSheetOpen} onOpenChange={setIsLoginSheetOpen}>
              <SheetTrigger asChild>
                <div />
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh]">
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
