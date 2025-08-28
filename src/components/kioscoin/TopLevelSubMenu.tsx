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
}

const UserOrdersMenu: React.FC<TopLevelSubMenuProps> = ({
  activeSubFilter,
  setActiveSubFilter,
  refreshKey,
  user,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full">
      {user && (
        <div className="sticky w-full top-0 z-10 bg-backgroundMain">
          <div className="flex justify-center space-x-2 py-2 pb-4 w-full">
            <Button
              className={`flex-1 ${
                activeSubFilter === Filter.PENDING
                  ? "bg-primary text-white shadow-lg"
                  : "hover:bg-primary/90 text-primary bg-white border-2 border-primary/30"
              }`}
              onClick={() => setActiveSubFilter(Filter.PENDING)}
            >
              {t("pending")}
            </Button>
            <Button
              className={`flex-1 ${
                activeSubFilter === Filter.WAITING_PAYMENT
                  ? "bg-primary text-white shadow-lg"
                  : "hover:bg-primary/90 text-primary bg-white border-2 border-primary/30"
              }`}
              onClick={() => setActiveSubFilter(Filter.WAITING_PAYMENT)}
            >
              {t("ongoing")}
            </Button>
            <Button
              className={`flex-1 ${
                activeSubFilter === Filter.CLOSED
                  ? "bg-primary text-white shadow-lg"
                  : "hover:bg-primary/90 text-primary bg-white border-2 border-primary/30"
              }`}
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
        />
      </div>
    </div>
  );
};

export default UserOrdersMenu;
