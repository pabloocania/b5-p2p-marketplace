import React from "react";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="flex w-full space-x-2">
      <Button
        className={`flex-1 border ${
          activeComponent === "OrderFeed"
            ? "bg-secondary text-white"
            : "border-black hover:bg-primary text-white"
        }`}
        onClick={() => setActiveComponent("OrderFeed")}
      >
        P2P Market
      </Button>
      <Button
        className={`flex-1 border ${
          activeComponent === "MyOrders"
            ? "bg-secondary text-white"
            : "border-black hover:bg-primary text-white"
        }`}
        onClick={() => setActiveComponent("MyOrders")}
      >
        My Orders
      </Button>
      <Button
        className={`flex-1 border ${
          activeComponent === "UserMenu"
            ? "bg-secondary text-white"
            : "border-black hover:bg-primary text-white"
        }`}
        onClick={handleUserMenuOpen}
      >
        Profile
      </Button>
    </div>
  );
};

export default MainMenu;
