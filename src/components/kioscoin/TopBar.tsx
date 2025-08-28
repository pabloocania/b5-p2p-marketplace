"use client";
import { Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
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
            {/* Logo en el borde izquierdo */}
            <div className="flex items-center">
              <img
                src="/icons/kioscoin-isotipo.png"
                alt="Kioscoin"
                className="h-16 w-16 sm:h-21 sm:w-21"
              />
            </div>

            {/* Título centrado en la mitad de la pantalla */}
            <div className="flex-1 flex justify-center">
              <span className="text-primary text-xl sm:text-2xl font-bold font-primary">
                Kioscoin
              </span>
            </div>

            {/* Botón campanita */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              className="p-2 hover:bg-gray-100 w-12 sm:w-14"
            >
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </Button>
          </>
        );

      case "MyOrders":
        return (
          <>
            {/* Logo en el borde izquierdo */}
            <div className="flex items-center">
              <img
                src="/icons/kioscoin-isotipo.png"
                alt="Kioscoin"
                className="h-16 w-16 sm:h-21 sm:w-21"
              />
            </div>

            {/* Título centrado en la mitad de la pantalla */}
            <div className="flex-1 flex justify-center">
              <span className="text-primary text-lg sm:text-xl font-semibold font-primary">
                {t("my_orders")}
              </span>
            </div>

            {/* Botón campanita */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              className="p-2 hover:bg-gray-100 w-12 sm:w-14"
            >
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </Button>
          </>
        );

      case "UserMenu":
        return (
          <>
            {/* Logo en el borde izquierdo */}
            <div className="flex items-center">
              <img
                src="/icons/kioscoin-isotipo.png"
                alt="Kioscoin"
                className="h-16 w-16 sm:h-21 sm:w-21"
              />
            </div>

            {/* Título centrado en la mitad de la pantalla */}
            <div className="flex-1 flex justify-center">
              <span className="text-primary text-lg sm:text-xl font-semibold font-primary">
                {t("my_account")}
              </span>
            </div>

            {/* Botón hamburguesa */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMenuClick}
              className="p-2 hover:bg-gray-100 w-12 sm:w-14"
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
