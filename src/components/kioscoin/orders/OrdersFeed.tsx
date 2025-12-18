import { useEffect, useState } from "react";
import { Order, OrderStatus, GetOrdersParams } from "b5-api-client";
import { OrderCard } from "./OrderCard";
import { ScrollableContainer } from "../ScrollabelContainer";
import { p2pMarketAPIClient as client } from "../../../lib/APIClients";
import { useKioscoinUserContext } from "../users/KioscoinUserContext";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  FilterBar,
  FilterState,
  FilterGroupType,
  FilterGroupConfig,
} from "../filter";
import { initializeFilterConstants } from "../filter/constants";
import KioscoinUserLoginFlow from "../users/KioscoinUserLoginFlow";
import { CreateOrderContainer } from "./create-orders/CreateOrderContainer";
import CreateOrder from "./create-orders/CreateOrderForm";
import { Plus, X, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigation } from "../NavigationContext";

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
  filterGroups?: FilterGroupConfig[]; // Add filterGroups prop
  showDetails?: boolean; // Show details for a specific order
}

export default function OrdersFeed({
  orderId,
  creatorId,
  buyerId,
  filter = Filter.ALL,
  refreshKey,
  refreshInterval = 15000,
  resetSelectedOrder,
  onBack,
  filterGroups,
  showDetails: initialShowDetails,
}: OrderFeedProps) {
  const { user, login, loginId } = useKioscoinUserContext();
  const { clearParams, params: navParams } = useNavigation();
  const isFromDeeplink = navParams?.isDeeplink ?? false;
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(
    undefined
  );
  const [showDetails, setShowDetails] = useState(initialShowDetails ?? false);
  const { t } = useTranslation();
  const [isLoginSheetOpen, setIsLoginSheetOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  // State for deeplinked/shared order
  const [deeplinkedOrder, setDeeplinkedOrder] = useState<Order | undefined>(
    undefined
  );
  const [isDeeplinkActive, setIsDeeplinkActive] = useState(false);
  const { navigate } = useNavigation();
  const [prevSelectedStatus, setPrevSelectedStatus] = useState<
    string | undefined
  >(undefined);

  // Fetch specific order by ID if provided (deeplink)
  useEffect(() => {
    const fetchOrderById = async () => {
      if (orderId && loginId) {
        try {
          const response = await client.getOrderById(orderId, {
            Authorization: `Bearer ${loginId}`,
          });
          if (response?.orders?.[0]) {
            setDeeplinkedOrder(response.orders[0]);
            setIsDeeplinkActive(true);
          }
        } catch (error) {
          console.error("Failed to fetch order by ID:", error);
          setIsDeeplinkActive(false);
        }
      } else if (!orderId) {
        // Clear deeplink state when orderId is removed
        setDeeplinkedOrder(undefined);
        setIsDeeplinkActive(false);
      }
    };
    fetchOrderById();
  }, [orderId, loginId]);

  // Auto-open the deeplinked order details when requested by caller
  useEffect(() => {
    if (deeplinkedOrder && initialShowDetails) {
      setShowDetails(true);
    }
  }, [deeplinkedOrder, initialShowDetails]);

  // Auto-navigate to CLOSED when the selected order transitions to a closed status
  useEffect(() => {
    if (selectedOrder) {
      if (prevSelectedStatus !== selectedOrder.status) {
        setPrevSelectedStatus(selectedOrder.status);
        const closedStatuses = [
          "RELEASED",
          "COMPLETED_BY_ADMIN",
          "COMPLETED",
          "SUCCESS",
        ];
        if (
          closedStatuses.includes((selectedOrder.status || "") as string) &&
          filter !== Filter.CLOSED
        ) {
          navigate("MyOrders", {
            filter: Filter.CLOSED,
            orderId: selectedOrder.id,
            showDetails: true,
          });
        }
      }
    }
  }, [selectedOrder, prevSelectedStatus, filter, navigate]);

  // Poll the selected order or deeplinked order by ID to keep status fresh across filters
  useEffect(() => {
    const shouldPoll =
      ((orderId && (showDetails || isDeeplinkActive)) ||
        (selectedOrder && showDetails)) &&
      !!loginId;
    if (!shouldPoll) return;
    let active = true;
    const idToFetch = (selectedOrder && selectedOrder.id) || orderId;
    const intervalId = setInterval(async () => {
      try {
        if (!idToFetch) return;
        const response = await client.getOrderById(idToFetch, {
          Authorization: `Bearer ${loginId}`,
        });
        const updated = response?.orders?.[0];
        if (active && updated) {
          setSelectedOrder((prev) => {
            if (!prev || prev.id !== updated.id) return updated;
            if (prev.status !== updated.status) return updated;
            return prev;
          });
        }
      } catch {
        // ignore polling errors
      }
    }, refreshInterval);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [
    orderId,
    selectedOrder?.id,
    showDetails,
    isDeeplinkActive,
    loginId,
    refreshInterval,
  ]);

  // Clear deeplink filter to show all orders
  const clearDeeplinkFilter = () => {
    setDeeplinkedOrder(undefined);
    setIsDeeplinkActive(false);
    setShowDetails(false);
    clearParams(); // Also clear navigation params so filters reappear
  };

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

  const handleCreateOrderClose = () => {
    setIsCreateOrderOpen(false);
    refreshOrders();
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
    setShowDetails(true);
  };

  const handleBack = () => {
    setSelectedOrder(undefined);
    setShowDetails(false);
    if (onBack) {
      onBack(); // Call the onBack function if provided
    }
  };

  return (
    <div className="w-full flex flex-col">
      <ScrollableContainer>
        {filter === Filter.ALL || user ? (
          <>
            {selectedOrder ? (
              <OrderCard
                orderDTO={selectedOrder}
                showDetails={showDetails}
                onRefresh={refreshOrders}
              />
            ) : isDeeplinkActive && deeplinkedOrder ? (
              <>
                {/* Only show "Shared order" banner for URL deeplinks, not notifications */}
                <div className="mb-2">
                  <div className="bg-secondary/20 shadow-sm font-secondary px-3 py-2 rounded-lg bg-white border border-secondary/20 shadow-md">
                    <div className="flex items-center">
                      {isFromDeeplink && (
                        <div className="flex items-center gap-2">
                          <Link size={16} className="text-primary" />
                          <span className="text-xs text-primary font-medium">
                            {t("shared_order", "Shared order")}
                          </span>
                        </div>
                      )}
                      <Badge
                        className="ml-auto bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer flex items-center gap-1 text-xs"
                        onClick={clearDeeplinkFilter}
                      >
                        {t("show_all_orders", "Show all orders")}
                        <X size={12} />
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-white rounded-lg border border-none shadow-primary/20">
                  <OrderCard
                    showDetails={showDetails}
                    orderDTO={deeplinkedOrder}
                    onSelect={handleOrderSelect}
                    onRefresh={refreshOrders}
                  />
                </div>
              </>
            ) : (
              <>
                {/* FilterBar always visible when no order is selected */}
                <div className="mb-2">
                  <FilterBar
                    filters={filterState}
                    setFilters={setFilterState}
                    filterGroups={filterGroups || defaultFilterGroups}
                  />
                </div>

                {orders && orders.length > 0 ? (
                  <div className="space-y-4 p-4 bg-white rounded-lg border border-none shadow-primary/20">
                    {orders.map((order) => (
                      <div key={order.id}>
                        <OrderCard
                          orderDTO={order}
                          onSelect={handleOrderSelect}
                          onRefresh={refreshOrders}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 py-4">
                    <div className="text-dark font-bold font-secondary text-center">
                      {t("no_orders_available")}
                    </div>
                    {user ? (
                      <CreateOrderContainer
                        open={isCreateOrderOpen}
                        onOpenChange={(open) => {
                          setIsCreateOrderOpen(open);
                          if (!open) handleCreateOrderClose();
                        }}
                        trigger={
                          <Button className="bg-primary text-white font-secondary hover:bg-primary/90 shadow-lg">
                            <Plus className="h-4 w-4 mr-2" />
                            {t("create_order")}
                          </Button>
                        }
                        className="p-2"
                      >
                        <CreateOrder
                          onClose={handleCreateOrderClose}
                          onConnectWallet={() => setIsLoginSheetOpen(true)}
                          preFilledData={{
                            fiatCode: "ARS",
                            paymentMethods: [],
                          }}
                        />
                      </CreateOrderContainer>
                    ) : (
                      <>
                        <Button
                          onClick={() => setIsLoginSheetOpen(true)}
                          className="bg-primary text-white font-secondary hover:bg-primary/90 shadow-lg w-full"
                        >
                          {t("login_to_start")}
                        </Button>
                        <KioscoinUserLoginFlow
                          variant="sheet"
                          open={isLoginSheetOpen}
                          onOpenChange={setIsLoginSheetOpen}
                          onLogin={login}
                        />
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center h-full">
            <Button
              onClick={() => setIsLoginSheetOpen(true)}
              className="w-full bg-primary text-white font-secondary"
            >
              {t("login_to_view")}
            </Button>
            <KioscoinUserLoginFlow
              variant="sheet"
              open={isLoginSheetOpen}
              onOpenChange={setIsLoginSheetOpen}
              onLogin={login}
            />
          </div>
        )}
      </ScrollableContainer>
    </div>
  );
}
