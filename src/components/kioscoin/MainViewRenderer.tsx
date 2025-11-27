import { useState, useEffect } from "react";
import { Filter } from "./orders/OrdersFeed";
import OrdersFeed from "./orders/OrdersFeed";
import UserMenuNew from "./users/UserMenuNew";
import { LandingPage } from "./landing/LandingPage";
import UserOrdersMenu from "./TopLevelSubMenu";
import KioscoinOperationFlow from "./orders/KioscoinOperationFlow";
import { KioscoinUser, UserData } from "b5-api-client";

export type ActiveView = "OrderFeed" | "UserMenu" | "MyOrders";

interface MainViewRendererProps {
  activeView: ActiveView;
  refreshKey: number;
  user: KioscoinUser | undefined;
  onLogin: (user: KioscoinUser, userData: UserData) => Promise<void>;
  onLogout: () => void;
  onOrderCreated: () => void;
}

export const MainViewRenderer: React.FC<MainViewRendererProps> = ({
  activeView,
  refreshKey,
  user,
  onLogin,
  onLogout,
  onOrderCreated,
}) => {
  // Encapsulated state for MyOrders filter - defaults to WAITING_PAYMENT
  const [myOrdersFilter, setMyOrdersFilter] = useState<Filter>(
    Filter.WAITING_PAYMENT
  );

  const shouldShowOperationFlow =
    activeView === "OrderFeed" || activeView === "MyOrders";

  const renderView = () => {
    switch (activeView) {
      case "OrderFeed":
        return <OrdersFeed refreshKey={refreshKey} />;

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
          activeComponent={activeView}
          onOrderCreated={onOrderCreated}
        />
      )}
      <div className="flex-1">{renderView()}</div>
    </>
  );
};
