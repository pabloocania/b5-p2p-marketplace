"use client";
import { Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { KioscoinIcon } from "@/icons/KioscoinIcon";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  activeComponent: string;
}

export function TopBar({ activeComponent }: TopBarProps) {
  const { t } = useTranslation();

  const handleNotificationClick = () => {
    // Placeholder - no action for now
    console.log("Notification button clicked");
  };

  const handleMenuClick = () => {
    // Placeholder - no action for now
    console.log("Menu button clicked");
  };

  const renderContent = () => {
    switch (activeComponent) {
      case "OrderFeed":
        return (
          <>
            {/* Logo como título */}
            <div className="flex items-center">
              <KioscoinIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-primary text-lg sm:text-xl font-semibold ml-2">
                Kioscoin
              </span>
            </div>
            {/* Botón campanita */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              className="p-2 hover:bg-gray-100"
            >
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </Button>
          </>
        );

      case "MyOrders":
        return (
          <>
            {/* Título centrado */}
            <div className="flex-1 text-center">
              <h1 className="text-lg sm:text-xl font-semibold text-primary">
                {t("my_orders")}
              </h1>
            </div>
            {/* Botón campanita */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              className="p-2 hover:bg-gray-100"
            >
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </Button>
          </>
        );

      case "UserMenu":
        return (
          <>
            {/* Título centrado */}
            <div className="flex-1 text-center">
              <h1 className="text-lg sm:text-xl font-semibold text-primary">
                {t("my_account")}
              </h1>
            </div>
            {/* Botón hamburguesa */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMenuClick}
              className="p-2 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed top-0 bg-white z-50 w-full border-b border-gray-200 shadow-sm">
      <div className="flex h-14 sm:h-19 items-center justify-between px-4 sm:px-6 max-w-md mx-auto">
        {renderContent()}
      </div>
    </div>
  );
}
