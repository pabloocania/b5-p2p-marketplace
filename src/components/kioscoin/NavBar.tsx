"use client";
import { Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { MarketplaceIcon } from "@/icons/MarketplaceIcon";

interface NavBarProps {
  activeComponent: string;
  setActiveComponent: (component: string) => void;
}

export function NavBar({ activeComponent, setActiveComponent }: NavBarProps) {
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
    <div className="border-b-4 border-b-primary py-1.5 fixed bottom-0 bg-white z-50 w-full">
      <div className="flex h-14 sm:h-19 items-center justify-between px-4 sm:px-6 max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveComponent(item.id)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[80px] sm:min-w-[100px] px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors h-14 sm:h-19",
              item.active
                ? "bg-primary/10 text-primary"
                : "text-primary/80 hover:bg-primary/5 border border-transparent"
            )}
          >
            <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span className="text-xs mt-0.5 font-medium text-primary">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
