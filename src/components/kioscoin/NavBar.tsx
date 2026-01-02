"use client";
import { Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { MarketplaceIcon } from "@/icons/MarketplaceIcon";
import { ActiveView } from "./NavigationContext";

interface NavBarProps {
  activeComponent: ActiveView;
  setActiveComponent: (component: ActiveView) => void;
}

export function NavBar({ activeComponent, setActiveComponent }: NavBarProps) {
  const { t } = useTranslation();

  // Centralized styling for nav buttons
  const commonButtonClasses =
    "flex flex-col items-center justify-center min-w-[80px] px-1 py-1 rounded-lg transition-colors h-14";
  const activeButtonClasses = "bg-primary/30";
  const inactiveButtonClasses = "hover:bg-white/10 border border-transparent";
  const getButtonClasses = (isActive: boolean) =>
    cn(
      commonButtonClasses,
      isActive ? activeButtonClasses : inactiveButtonClasses
    );

  const navItems: Array<{
    id: ActiveView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    active: boolean;
  }> = [
    {
      id: "OrderFeed" as const,
      label: t("p2p_market"),
      icon: MarketplaceIcon,
      active: activeComponent === "OrderFeed",
    },
    {
      id: "MyOrders" as const,
      label: t("my_orders"),
      icon: Wallet,
      active: activeComponent === "MyOrders",
    },
    {
      id: "UserMenu" as const,
      label: t("my_account"),
      icon: User,
      active: activeComponent === "UserMenu",
    },
  ];

  return (
    <div className="border-t border-t-primary/50 py-4 px-1 fixed bottom-0 bg-dark z-50 w-full shadow-top shadow-md transform-gpu">
      <div className="flex h-18 items-center justify-between px-6 max-w-md mx-auto touch-manipulation">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveComponent(item.id)}
            className={getButtonClasses(item.active)}
          >
            <item.icon className="h-5 w-5 sm:h-5 sm:w-5 text-white" />
            <span className="text-xs mt-1 font-medium text-secondary font-secondary">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
