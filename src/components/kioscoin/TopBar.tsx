"use client";
import { Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useMemo } from "react";
import { NotificationsPanel } from "./notifications/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { useUserContext } from "./users/UserContext";

interface TopBarProps {
  activeComponent: string;
}

export function TopBar({ activeComponent }: TopBarProps) {
  const { t } = useTranslation();
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] =
    useState(false);
  const { user } = useUserContext();

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

        {/* Botón campanita con badge */}
        {user && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              className="p-2 hover:bg-gray-100 w-12 sm:w-14"
            >
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </Button>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
          </div>
        )}
      </>
    );
  };
  return (
    <>
      <div className="fixed top-0 bg-white z-50 w-full border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between max-w-md mx-auto px-2">
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
