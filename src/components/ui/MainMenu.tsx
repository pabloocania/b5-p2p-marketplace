import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface MainMenuProps {
  activeComponent: string;
  setActiveComponent: (component: string) => void;
  handleUserMenuOpen?: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  activeComponent,
  setActiveComponent,
  handleUserMenuOpen,
}) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-md pr-2 pl-2 pt-5 pb-5 flex justify-center space-x-2 flex w-full">
      <Button
        className={`flex-1 ${
          activeComponent === "OrderFeed"
            ? "bg-secondary text-white"
            : "hover:bg-primary text-white bg-terciary"
        }`}
        onClick={() => setActiveComponent("OrderFeed")}
      >
        {t("mercado")}
      </Button>
      <Button
        className={`flex-1 ${
          activeComponent === "MyOrders"
            ? "bg-secondary text-white"
            : "hover:bg-primary text-white bg-terciary"
        }`}
        onClick={() => setActiveComponent("MyOrders")}
      >
        {t("mis_ordenes")}
      </Button>
      <Button
        className={`flex-1 ${
          activeComponent === "UserMenu"
            ? "bg-secondary text-white"
            : "hover:bg-primary text-white bg-terciary"
        }`}
        onClick={() => {
          setActiveComponent("UserMenu");
          handleUserMenuOpen?.();
        }}
      >
        {t("mi_cuenta")}
      </Button>
    </div>
  );
};

export default MainMenu;
