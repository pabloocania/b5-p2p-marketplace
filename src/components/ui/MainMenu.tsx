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
  return (
    <div className="max-w-md pr-2 pl-2 pt-5 flex justify-center space-x-2 w-full">
      <Button
        className={`w-1/3 h-10 ${
          activeComponent === "OrderFeed"
            ? "bg-secondary text-white"
            : "hover:bg-primary text-white"
        }`}
        onClick={() => setActiveComponent("OrderFeed")}
      >
        {t("p2p_market")}
      </Button>
      <Button
        className={`w-1/3 h-10 ${
          activeComponent === "MyOrders"
            ? "bg-secondary text-white"
            : "hover:bg-primary text-white"
        }`}
        onClick={() => setActiveComponent("MyOrders")}
      >
        {t("my_orders")}
      </Button>
      <Button
        className={`w-1/3 h-10 ${
          activeComponent === "UserMenu"
            ? "bg-secondary text-white"
            : "hover:bg-primary text-white"
        }`}
        onClick={handleUserMenuOpen}
      >
        {t("my_account")}
      </Button>
    </div>
  );
};

export default MainMenu;
