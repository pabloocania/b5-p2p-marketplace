import React from "react";
import { Button } from "@/components/ui/button";
import OrdersFeed, { Filter } from "./OrdersFeed";

interface TopLevelSubMenuProps {
  activeSubFilter: Filter;
  setActiveSubFilter: (filter: Filter) => void;
  refreshKey: number;
}

const TopLevelSubMenu: React.FC<TopLevelSubMenuProps> = ({
  activeSubFilter,
  setActiveSubFilter,
  refreshKey,
}) => {
  return (
    <>
      <div className="max-w-md pr-2 pl-2 pt-5 pb-5 flex justify-center space-x-2 flex w-full">
        <Button
          className={`flex-1 ${
            activeSubFilter === Filter.PENDING
              ? "bg-primary text-white"
              : "hover:bg-primary text-white bg-terciary "
          }`}
          onClick={() => setActiveSubFilter(Filter.PENDING)}
        >
          Pending
        </Button>
        <Button
          className={`flex-1 ${
            activeSubFilter === Filter.WAITING_PAYMENT
              ? "bg-primary text-white"
              : "hover:bg-primary text-white bg-terciary "
          }`}
          onClick={() => setActiveSubFilter(Filter.WAITING_PAYMENT)}
        >
          On Going
        </Button>
        <Button
          className={`flex-1 ${
            activeSubFilter === Filter.CLOSED
              ? "bg-primary text-white"
              : "hover:bg-primary text-white bg-terciary "
          }`}
          onClick={() => setActiveSubFilter(Filter.CLOSED)}
        >
          Closed
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

export default TopLevelSubMenu;
