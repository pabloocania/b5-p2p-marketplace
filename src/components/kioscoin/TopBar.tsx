"use client";
import { Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { KioscoinIcon } from "@/icons/KioscoinIcon";
import { MarketplaceIcon } from "@/icons/MarketplaceIcon";

interface TopBarProps {
  activeComponent: string;
  setActiveComponent: (component: string) => void;
}

export function TopBar({ activeComponent, setActiveComponent }: TopBarProps) {
  const { t } = useTranslation();

  const navItems = [
    {
      id: "OrderFeed",
      label: t("p2p_market"),
      icon: MarketplaceIcon,
      active: activeComponent === "OrderFeed",
    },
    {
      id: "MyOrders",
      label: t("my_orders"),
      icon: Wallet,
      active: activeComponent === "MyOrders",
    },
    {
      id: "UserMenu",
      label: t("my_account"),
      icon: User,
      active: activeComponent === "UserMenu",
    },
  ];

  return (
    <div className="border-b-4 border-b-secondary py-1.5 fixed bottom-0 bg-white z-50 w-full">
      <div className="flex h-12 sm:h-16 items-center px-1 sm:px-2 max-w-md mx-auto">
        <button
          onClick={() => setActiveComponent("OrderFeed")}
          className="flex items-end"
        >
          <KioscoinIcon className="h-12 w-12 sm:h-16 sm:w-16" />
          <span className="text-primary text-xs sm:text-sm md:text-lg font-semibold mr-1 sm:mr-2">
            Kioscoin
          </span>
        </button>

        <div className="h-12 sm:h-16 w-px bg-primary mx-1 sm:mx-2"></div>

        <nav className="pl-1 sm:pl-2 flex items-center gap-0.5 sm:gap-1 ml-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveComponent(item.id)}
              className={cn(
                "flex flex-col items-center min-w-[40px] sm:min-w-[50px] px-1 sm:px-1.5 py-1.5 sm:py-2 rounded-lg transition-colors h-12 sm:h-16",
                item.active
                  ? "bg-secondary/20 text-primary"
                  : "text-primary/80 hover:bg-white/10 border border-transparent"
              )}
            >
              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-xs mt-0.5 font-medium text-primary">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
