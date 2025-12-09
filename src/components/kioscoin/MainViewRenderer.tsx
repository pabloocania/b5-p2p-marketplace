import { useState, useEffect } from "react";
import { Filter } from "./orders/OrdersFeed";
import OrdersFeed from "./orders/OrdersFeed";
import UserMenuNew from "./users/UserMenuNew";
import { LandingPage } from "./landing/LandingPage";
import UserOrdersMenu from "./TopLevelSubMenu";
import KioscoinOperationFlow from "./orders/KioscoinOperationFlow";
import { KioscoinUser, UserData } from "b5-api-client";
import { useNavigation, ActiveView } from "./NavigationContext";

// Re-export ActiveView for backward compatibility
export type { ActiveView } from "./NavigationContext";

interface MainViewRendererProps {
  refreshKey: number;
  user: KioscoinUser | undefined;
  onLogin: (user: KioscoinUser, userData: UserData) => Promise<void>;
  onLogout: () => void;
  onOrderCreated: () => void;
}

export const MainViewRenderer: React.FC<MainViewRendererProps> = ({
  refreshKey,
  user,
  onLogin,
  onLogout,
  onOrderCreated,
}) => {
  const { currentView, params } = useNavigation();

  // Encapsulated state for MyOrders filter - defaults to WAITING_PAYMENT
  // Only updated when explicitly navigating to MyOrders with a filter param
  const [myOrdersFilter, setMyOrdersFilter] = useState<Filter>(
    Filter.WAITING_PAYMENT
  );

  // Update filter from navigation params only when navigating to MyOrders
  // This prevents deeplink params (for OrderFeed) from affecting MyOrders filter
  useEffect(() => {
    if (currentView === "MyOrders" && params?.filter) {
      setMyOrdersFilter(params.filter);
    }
  }, [currentView, params?.filter]);

  const shouldShowOperationFlow =
    currentView === "OrderFeed" || currentView === "MyOrders";

  const renderView = () => {
    switch (currentView) {
      case "OrderFeed":
        return (
          <OrdersFeed
            refreshKey={refreshKey}
            orderId={params?.orderId}
            showDetails={params?.showDetails}
          />
        );

      case "UserMenu":
        if (!user) {
          return <LandingPage />;
        }
        return (
          <UserMenuNew user={user} onLogin={onLogin} onLogout={onLogout} />
        );

      case "MyOrders":
        return (
          <UserOrdersMenu
            activeSubFilter={myOrdersFilter}
            setActiveSubFilter={setMyOrdersFilter}
            refreshKey={refreshKey}
            user={user}
          />
        );

      default:
        return <OrdersFeed refreshKey={refreshKey} />;
    }
  };

  return (
    <>
      {shouldShowOperationFlow && (
        <KioscoinOperationFlow
          activeComponent={currentView}
          onOrderCreated={onOrderCreated}
        />
      )}
      <div className="flex-1">{renderView()}</div>
    </>
  );
};
