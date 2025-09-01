import { useEffect, useState } from "react";
import {
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  GetOrdersParams as OriginalGetOrdersParams,
  GetOrdersParams,
} from "b5-api-client";
import { OrderCard } from "./OrderCard";
import { ScrollableContainer } from "../ScrollabelContainer";
import { p2pMarketAPIClient as client } from "../../../lib/APIClients";
import { useUserContext } from "../users/UserContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import UserMenuNew from "../users/UserMenuNew";
import { useTranslation } from "react-i18next";
import {
  FilterBar,
  FilterState,
  FilterGroupType,
  FilterGroupConfig,
} from "../filter";
import { initializeFilterConstants } from "../filter/constants";
import { ConfigStore } from "@/lib/ConfigStore";

export enum Filter {
  ALL = "ALL",
  PENDING = "PENDING",
  WAITING_PAYMENT = "WAITING_PAYMENT",
  CLOSED = "CLOSED",
}

const params: GetOrdersParams = {};

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
  filterGroups?: FilterGroupConfig[]; // Add filterGroups prop
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
  filterGroups,
}: OrderFeedProps) {
  const { user, login, logout, loginId } = useUserContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(
    undefined
  );
  const { t } = useTranslation();
  const [isLoginSheetOpen, setIsLoginSheetOpen] = useState(false);

  // Initialize filter state
  const [filterState, setFilterState] = useState<FilterState>({
    orderType: [],
    status: [],
    blockchain: [],
    tokenCode: [],
    paymentMethods: [],
    fiatCode: [],
    fiatAmountRange: {
      min: undefined,
      max: undefined,
    },
    dateRange: {
      from: undefined,
      to: undefined,
    },
    search: "",
  });

  // Initialize filter constants
  useEffect(() => {
    initializeFilterConstants();
  }, []);

  // Define default filter groups if none are provided
  const defaultFilterGroups: FilterGroupConfig[] = [
    // { type: FilterGroupType.SEARCH },
    { type: FilterGroupType.ORDER_TYPE, title: "Order Type" },
    // { type: FilterGroupType.STATUS, title: "Status" },
    { type: FilterGroupType.BLOCKCHAIN, title: "Blockchain" },
    { type: FilterGroupType.TOKEN_CODE, title: "Token" },
    { type: FilterGroupType.PAYMENT_METHODS, title: "Payment Methods" },
    { type: FilterGroupType.FIAT_AMOUNT_RANGE, title: "Fiat Amount" },
  ];

  const fetchOrders = async () => {
    try {
      let response;
      const userId = user?.id || buyerId || creatorId;

      // Base parameters for the API call
      const params: GetOrdersParams = {};

      // Add user filter if available
      if (userId && filter !== Filter.ALL) {
        params.user = userId;
      }

      // Add status filter based on the current filter enum
      if (filter === Filter.ALL) {
        params.status = [Filter.PENDING];
      } else if (filter === Filter.PENDING) {
        params.status = [Filter.PENDING];
      } else if (filter === Filter.WAITING_PAYMENT) {
        params.status = [
          "WAITING_PAYMENT" as OrderStatus,
          "ACTIVE",
          "FIAT_SENT",
        ];
      } else if (filter === Filter.CLOSED) {
        params.status = ["RELEASED", "COMPLETED_BY_ADMIN"];
      }

      // Add filter parameters from FilterBar
      if (filterState.orderType.length > 0) {
        params.orderType = filterState.orderType;
      }

      if (filterState.tokenCode.length > 0) {
        params.tokenCode = filterState.tokenCode;
      }

      if (filterState.paymentMethods.length > 0) {
        params.paymentMethods = filterState.paymentMethods.map((method) => ({
          type: method.type,
          alias: method.alias,
          cbu: method.cbu,
          fullName: method.fullName,
          entity: method.entity,
        }));
      }

      if (filterState.fiatCode.length > 0) {
        params.fiatCode = filterState.fiatCode;
      }

      if (
        filterState.fiatAmountRange.min !== undefined ||
        filterState.fiatAmountRange.max !== undefined
      ) {
        params.fiatAmountRange = {
          min: filterState.fiatAmountRange.min
            ? filterState.fiatAmountRange.min.toString()
            : undefined,
          max: filterState.fiatAmountRange.max
            ? filterState.fiatAmountRange.max.toString()
            : undefined,
        };
      }

      if (
        filterState.dateRange.from !== undefined ||
        filterState.dateRange.to !== undefined
      ) {
        params.dateRange = {
          from: filterState.dateRange.from?.toISOString(),
          to: filterState.dateRange.to?.toISOString(),
        };
      }

      if (filterState.search) {
        params.search = filterState.search;
      }

      // Make the API call with the constructed parameters
      response = await client.getOrders(params, {
        Authorization: `Bearer ${loginId}`,
      });

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
  }, [user, creatorId, buyerId, filter, refreshKey, filterState]);

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
  }, [filter, refreshInterval, user, creatorId, buyerId, filterState]);

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
    <div className="w-full flex flex-col">
      <ScrollableContainer>
        {filter === Filter.ALL || user ? (
          <>
            <div className="mb-6 sm:mb-8">
              <FilterBar
                filters={filterState}
                setFilters={setFilterState}
                filterGroups={filterGroups || defaultFilterGroups}
              />
            </div>
            {selectedOrder ? (
              <OrderCard
                orderDTO={selectedOrder}
                showDetails={true}
                onRefresh={refreshOrders}
              />
            ) : orders && orders.length > 0 ? (
              <div>
                {orders.map((order) => (
                  <div key={order.id} className="mb-3 md:mb-7">
                    <OrderCard
                      orderDTO={order}
                      onSelect={handleOrderSelect}
                      onRefresh={refreshOrders}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center h-full">
                <div className="mb-5 text-primary font-bold">
                  {t("no_orders_available")}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center h-full">
            <Button
              onClick={() => setIsLoginSheetOpen(true)}
              className="w-full bg-primary text-white"
            >
              {t("login_to_view")}
            </Button>
            <Sheet open={isLoginSheetOpen} onOpenChange={setIsLoginSheetOpen}>
              <SheetTrigger asChild>
                <div />
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[75vh]"
                closeText={t("close")}
              >
                <UserMenuNew user={user} onLogin={login} onLogout={logout} />
              </SheetContent>
            </Sheet>
          </div>
        )}
      </ScrollableContainer>
    </div>
  );
}
