"use client";
import { Bell, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useMemo } from "react";
import { NotificationsPanel } from "./notifications/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { useKioscoinUserContext } from "./users/KioscoinUserContext";

interface TopBarProps {
  activeComponent: string;
}

export function TopBar({ activeComponent }: TopBarProps) {
  const { t } = useTranslation();
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] =
    useState(false);
  const { user } = useKioscoinUserContext();

  const apiBaseUrl = useMemo(
    () =>
      process.env.NEXT_PUBLIC_KIOSCOIN_API_BASE ??
      "https://bolsillo-argento-586dfd80364d.herokuapp.com",
    []
  );

  // Use notifications hook
  const { notifications, unreadCount, isLoading, error, markAsRead } =
    useNotifications(apiBaseUrl);

  const handleNotificationClick = useCallback(() => {
    setIsNotificationsPanelOpen(true);
  }, []);

  const renderContent = () => {
    return (
      <>
        {(activeComponent !== "UserMenu" ||
          (activeComponent === "UserMenu" && user)) && (
          <>
            <div className="flex items-center">
              <img
                src="/icons/kioscoin-isotipo.png"
                alt="Kioscoin"
                className="h-16 w-16 sm:h-21 sm:w-21"
              />
            </div>

            {/* Título centrado respecto a todo el contenedor */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <span className="text-dark text-xl sm:text-2xl text-secondary">
                {/* Kioscoin */}
              </span>
            </div>
            {user && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNotificationClick}
                  className="p-2 text-secondary hover:text-primary w-12 sm:w-14"
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                </Button>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center font-secondary">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </>
    );
  };
  return (
    <>
      <div className="fixed top-0 z-50 w-full bg-dark shadow-lg pt-[env(safe-area-inset-top)]">
        <div className="relative flex items-center justify-between max-w-md mx-auto px-2">
          {renderContent()}
        </div>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel
        notifications={notifications}
        isOpen={isNotificationsPanelOpen}
        onClose={() => setIsNotificationsPanelOpen(false)}
        onMarkAsRead={markAsRead}
        isLoading={isLoading}
      />
    </>
  );
}
