"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { Filter } from "./orders/OrdersFeed";

export type ActiveView = "OrderFeed" | "UserMenu" | "MyOrders";

export interface NavigationParams {
  orderId?: string;
  filter?: Filter;
  showDetails?: boolean;
}

interface NavigationState {
  view: ActiveView;
  params?: NavigationParams;
}

interface NavigationContextValue {
  currentView: ActiveView;
  params: NavigationParams | undefined;
  navigate: (view: ActiveView, params?: NavigationParams) => void;
  clearParams: () => void;
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

  const value: NavigationContextValue = {
    currentView: state.view,
    params: state.params,
    navigate,
    clearParams,
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
