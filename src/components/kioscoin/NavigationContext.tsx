"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { Filter } from "./orders/OrdersFeed";

export type ActiveView = "OrderFeed" | "UserMenu" | "MyOrders";

export interface NavigationParams {
  orderId?: string;
  filter?: Filter;
  showDetails?: boolean;
  isDeeplink?: boolean; // True only when order opened via URL deeplink (not from notifications)
}

interface NavigationState {
  view: ActiveView;
  params?: NavigationParams;
}

interface PendingNavigation {
  view: ActiveView;
  params?: NavigationParams;
}

interface OrderRefresh {
  trigger: number;
  refresh: () => void;
}

interface NavigationContextValue {
  currentView: ActiveView;
  params: NavigationParams | undefined;
  navigate: (view: ActiveView, params?: NavigationParams) => void;
  clearParams: () => void;
  pendingNavigation: PendingNavigation | undefined;
  setPendingNavigation: (pending: PendingNavigation | undefined) => void;
  executePendingNavigation: () => void;
  orderRefresh: OrderRefresh;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined
);

interface NavigationProviderProps {
  readonly children: React.ReactNode;
  readonly initialView?: ActiveView;
  readonly onViewChange?: (view: ActiveView) => void;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  initialView = "OrderFeed",
  onViewChange,
}) => {
  const [state, setState] = useState<NavigationState>({
    view: initialView,
    params: undefined,
  });
  const [pendingNavigation, setPendingNavigation] = useState<
    PendingNavigation | undefined
  >(undefined);
  const [orderRefreshTrigger, setOrderRefreshTrigger] = useState(0);

  const navigate = useCallback(
    (view: ActiveView, params?: NavigationParams) => {
      setState({ view, params });
      onViewChange?.(view);
    },
    [onViewChange]
  );

  const clearParams = useCallback(() => {
    setState((prev) => ({ ...prev, params: undefined }));
  }, []);

  const executePendingNavigation = useCallback(() => {
    if (pendingNavigation) {
      navigate(pendingNavigation.view, pendingNavigation.params);
      setPendingNavigation(undefined);
      // Clean URL after navigation
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [pendingNavigation, navigate]);

  const refreshOrder = useCallback(() => {
    setOrderRefreshTrigger((prev) => prev + 1);
  }, []);

  const value: NavigationContextValue = {
    currentView: state.view,
    params: state.params,
    navigate,
    clearParams,
    pendingNavigation,
    setPendingNavigation,
    executePendingNavigation,
    orderRefresh: {
      trigger: orderRefreshTrigger,
      refresh: refreshOrder,
    },
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextValue => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
