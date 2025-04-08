import React from "react";
import { Button } from "@/components/ui/button";
import OrdersFeed, { Filter } from "./OrdersFeed";
import { useTranslation } from "react-i18next";

interface TopLevelSubMenuProps {
  activeSubFilter: Filter;
  setActiveSubFilter: (filter: Filter) => void;
  refreshKey: number;
  orderId?: string;
}

const UserOrdersMenu: React.FC<TopLevelSubMenuProps> = ({
  activeSubFilter,
  setActiveSubFilter,
  refreshKey,
  orderId,
}) => {
  const { t } = useTranslation();

  // Si hay un orderId, no mostramos nada
  if (orderId) {
    return null;
  }

  return (
    <>
      <div className="max-w-md pr-2 pl-2 pt-5 pb-5 flex justify-center space-x-2 flex w-full">
        <Button
          className={`flex-1 ${
            activeSubFilter === Filter.PENDING
              ? "bg-secondary text-white"
              : "hover:bg-primary text-white bg-terciary"
          }`}
          onClick={() => setActiveSubFilter(Filter.PENDING)}
        >
          {t("pending")}
        </Button>
        <Button
          className={`flex-1 ${
            activeSubFilter === Filter.WAITING_PAYMENT
              ? "bg-secondary text-white"
              : "hover:bg-primary text-white bg-terciary "
          }`}
          onClick={() => setActiveSubFilter(Filter.WAITING_PAYMENT)}
        >
          {t("ongoing")}
        </Button>
        <Button
          className={`flex-1 ${
            activeSubFilter === Filter.CLOSED
              ? "bg-secondary text-white"
              : "hover:bg-primary text-white bg-terciary "
          }`}
          onClick={() => setActiveSubFilter(Filter.CLOSED)}
        >
          {t("closed")}
        </Button>
      </div>
      <OrdersFeed
        filter={activeSubFilter}
        refreshKey={refreshKey}
        resetSelectedOrder={true}
      />
    </>
  );
};

export default UserOrdersMenu;
