import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface MainMenuProps {
  activeComponent: string;
  setActiveComponent: (component: string) => void;
  handleUserMenuOpen: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  activeComponent,
  setActiveComponent,
  handleUserMenuOpen,
}) => {
  const { t } = useTranslation();

  // Centralized styling for main menu buttons
  const commonButtonClasses = "w-1/3 h-10";
  const activeButtonClasses = "bg-secondary text-white";
  const inactiveButtonClasses = "hover:bg-primary text-white";
  const getButtonClasses = (component: string) =>
    `${commonButtonClasses} ${
      activeComponent === component
        ? activeButtonClasses
        : inactiveButtonClasses
    }`;
  return (
    <div className="max-w-md pr-2 pl-2 pt-5 flex justify-center space-x-2 w-full">
      <Button
        className={getButtonClasses("OrderFeed")}
        onClick={() => setActiveComponent("OrderFeed")}
      >
        {t("p2p_market")}
      </Button>
      <Button
        className={getButtonClasses("MyOrders")}
        onClick={() => setActiveComponent("MyOrders")}
      >
        {t("my_orders")}
      </Button>
      <Button
        className={getButtonClasses("UserMenu")}
        onClick={handleUserMenuOpen}
      >
        {t("my_account")}
      </Button>
    </div>
  );
};

export default MainMenu;
