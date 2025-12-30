"use client";

import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { NotificationDto } from "b5-api-client";
import NotificationCard from "./NotificationCard";

interface NotificationsPanelProps {
  notifications: NotificationDto[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => Promise<void>;
  isLoading?: boolean;
}

export function NotificationsPanel({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  isLoading = false,
}: NotificationsPanelProps) {
  const { t } = useTranslation();
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set());

  const handleMarkAsRead = async (
    notificationId: string,
    readAt: string | null | undefined
  ) => {
    if (readAt) return; // Already read

    setMarkingAsRead((prev) => new Set(prev).add(notificationId));
    try {
      await onMarkAsRead(notificationId);
    } finally {
      setMarkingAsRead((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] transition-opacity duration-300 ease-in-out text-primary"
      onClick={onClose}
      style={{
        backgroundColor: isOpen ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      <div
        className="absolute right-0 top-0 h-full w-full sm:max-w-sm bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-primary">
            {t("notifications") || "Notifications"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-0 h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-500">
                {t("loading") || "Loading..."}
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 p-8">
              <AlertCircle className="h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500 text-center">
                {t("no_notifications") || "No notifications yet"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-3">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onNavigate={onClose}
                  onClick={() =>
                    handleMarkAsRead(notification.id, notification.readAt)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
