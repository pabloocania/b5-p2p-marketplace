import React from "react";
import { Button } from "@/components/ui/button";
import OrdersFeed, { Filter } from "./orders/OrdersFeed";
import { useTranslation } from "react-i18next";
import { KioscoinUser } from "b5-api-client";
import { useNavigation } from "./NavigationContext";

interface TopLevelSubMenuProps {
  activeSubFilter: Filter;
  setActiveSubFilter: (filter: Filter) => void;
  refreshKey: number;
  user: KioscoinUser | undefined;
  orderId?: string;
}

const UserOrdersMenu: React.FC<TopLevelSubMenuProps> = ({
  activeSubFilter,
  setActiveSubFilter,
  refreshKey,
  user,
  orderId,
}) => {
  const { t } = useTranslation();
  const { clearParams } = useNavigation();

  // When user selects a filter, clear any deeplink params to exit the shared order view
  const handleFilterChange = (filter: Filter) => {
    clearParams();
    setActiveSubFilter(filter);
  };

  // Centralized styling for sub-filter buttons
  const commonButtonClasses = "flex-1 text-xs";
  const activeButtonClasses =
    "bg-primary text-white shadow-lg border border-secondary";
  const inactiveBaseClasses =
    "hover:bg-primary/70 hover:text-white text-dark text-muted-foreground bg-secondary/10";
  const inactiveVariantClasses: Record<Filter, string> = {
    [Filter.ALL]: "bg-secondary/10",
    [Filter.PENDING]: "bg-secondary/10",
    [Filter.WAITING_PAYMENT]: "bg-secondary/10",
    [Filter.CLOSED]: "bg-secondary/10",
  };
  const getButtonClasses = (filter: Filter) =>
    `${commonButtonClasses} ${
      activeSubFilter === filter
        ? activeButtonClasses
        : `${inactiveBaseClasses} ${inactiveVariantClasses[filter]}`
    }`;

  // Hide filter menu when viewing a specific order (via deeplink or notification)
  const showFilters = user && !orderId;

  return (
    <div className="flex flex-col w-full space-y-2">
      {showFilters && (
        <div className="sticky w-full top-0 z-50 flex bg-white rounded-lg p-3 w-full gap-2 shadow-lg">
          <div className="flex justify-center font-secondary space-x-2 py-1 pb-1 w-full">
            <Button
              className={getButtonClasses(Filter.PENDING)}
              onClick={() => handleFilterChange(Filter.PENDING)}
            >
              {t("pending")}
            </Button>
            <Button
              className={getButtonClasses(Filter.WAITING_PAYMENT)}
              onClick={() => handleFilterChange(Filter.WAITING_PAYMENT)}
            >
              {t("ongoing")}
            </Button>
            <Button
              className={getButtonClasses(Filter.CLOSED)}
              onClick={() => handleFilterChange(Filter.CLOSED)}
            >
              {t("closed")}
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1">
        <OrdersFeed
          filter={activeSubFilter}
          refreshKey={refreshKey}
          resetSelectedOrder={true}
          orderId={orderId}
          showDetails={!!orderId}
        />
      </div>
    </div>
  );
};

export default UserOrdersMenu;
