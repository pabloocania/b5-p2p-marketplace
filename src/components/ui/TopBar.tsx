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
    <div className="border-b-4 border-b-secondary py-2 sticky top-0 bg-white z-10 w-full">
      <div className="flex h-20 items-center px-2 max-w-md mx-auto">
        <button
          onClick={() => setActiveComponent("OrderFeed")}
          className="flex items-end"
        >
          <KioscoinIcon className="h-20 w-20" />
          <span className="text-primary md:text-xl text-md font-semibold mr-2">
            Kioscoin
          </span>
        </button>

        <div className="h-20 w-px bg-primary mx-2"></div>

        <nav className="pl-2 flex items-center gap-1 ml-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveComponent(item.id)}
              className={cn(
                "flex flex-col items-center min-w-[60px] px-2 py-3 rounded-lg transition-colors h-20",
                item.active
                  ? "bg-secondary/20 text-primary"
                  : "text-primary/80 hover:bg-white/10 border border-transparent"
              )}
            >
              <item.icon className="h-6 w-6 text-primary" />
              <span className="text-xs mt-1 font-medium text-primary">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
