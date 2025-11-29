import React from "react";
import { Button } from "@/components/ui/button";
import OrdersFeed, { Filter } from "./orders/OrdersFeed";
import { useTranslation } from "react-i18next";
import { KioscoinUser } from "b5-api-client";

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

  // Centralized styling for sub-filter buttons
  const commonButtonClasses = "flex-1";
  const activeButtonClasses = "bg-primary text-white shadow-lg";
  const inactiveBaseClasses =
    "hover:bg-primary/80 hover:text-lightYellow text-dark text-muted-foreground bg-secondary/10 border-2 border-primary/10";
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

  return (
    <div className="flex flex-col w-full space-y-2">
      {user && (
        <div className="sticky w-full top-0 z-50 flex bg-white rounded-lg p-3 w-full gap-4 shadow-md border border-secondary/20">
          <div className="flex justify-center font-secondary space-x-2 py-2 pb-2 w-full">
            <Button
              className={getButtonClasses(Filter.PENDING)}
              onClick={() => setActiveSubFilter(Filter.PENDING)}
            >
              {t("pending")}
            </Button>
            <Button
              className={getButtonClasses(Filter.WAITING_PAYMENT)}
              onClick={() => setActiveSubFilter(Filter.WAITING_PAYMENT)}
            >
              {t("ongoing")}
            </Button>
            <Button
              className={getButtonClasses(Filter.CLOSED)}
              onClick={() => setActiveSubFilter(Filter.CLOSED)}
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
