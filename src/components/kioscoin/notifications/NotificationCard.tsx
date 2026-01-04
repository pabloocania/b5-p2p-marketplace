"use client";

import { Check } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import {
  NotificationDto,
  MessageContentEvent,
  MessageContent,
} from "b5-api-client";
import { getEventTypeTranslationKey } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/components/kioscoin/NavigationContext";
import { Filter } from "@/components/kioscoin/orders/OrdersFeed";

const EVENT_TYPE_TO_SUBTITLE_KEY = {
  TAKEN: "notification_event_taken",
  LOCKED: "notification_event_locked",
  RELEASED: "notification_event_released",
  FIAT_SENT: "notification_event_fiat_sent",
  REFUNDED: "notification_event_refunded",
  CANCELED: "notification_event_canceled",
  DISPUTED: "notification_event_disputed",
} as const;

export interface NotificationCardProps {
  notification: NotificationDto;
  onClick?: () => void | Promise<void>;
  onNavigate?: () => void;
  className?: string;
  // When shown inside a toast, we want a tighter layout
  compact?: boolean;
}

export function NotificationCard({
  notification,
  onClick,
  onNavigate,
  className,
  compact = false,
}: NotificationCardProps) {
  const { t } = useTranslation();
  const { navigate } = useNavigation();
  const isRead = Boolean(notification.readAt);

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.toLocaleDateString();
      const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${day} ${time}`;
    } catch {
      return dateString;
    }
  }, []);

  const getPreview = useCallback((): string => {
    if (notification.message?.content?.type === "TEXT") {
      return notification.message.content.text;
    }
    return "Notification";
  }, [notification]);

  const { isEvent, eventType, orderId, title, dateLabel } = useMemo(() => {
    const content = notification.message?.content as MessageContent | undefined;
    const eventContent =
      content?.type === "EVENT" ? (content as MessageContentEvent) : undefined;

    const oid = eventContent?.event?.orderId;
    const etRaw = eventContent?.event?.eventType;
    const et = etRaw?.trim().toUpperCase();

    const titleText = eventContent?.event?.eventType
      ? t(getEventTypeTranslationKey(et ?? ""))
      : getPreview();

    return {
      isEvent: Boolean(eventContent),
      eventType: et,
      orderId: oid,
      title: titleText,
      dateLabel: formatDate(notification.createdAt),
    };
  }, [formatDate, getPreview, notification, t]);

  const canNavigateToOrder = Boolean(orderId);
  const eventSubtitle = useMemo(() => {
    if (!isEvent) return "";
    const key =
      eventType &&
      (EVENT_TYPE_TO_SUBTITLE_KEY as Record<string, string | undefined>)[
        eventType
      ];
    if (!key) return t("notification_open_order") || "Open the order";
    return t(key);
  }, [eventType, isEvent, t]);

  const targetFilter = useMemo(() => {
    if (
      eventType === "RELEASED" ||
      eventType === "REFUNDED" ||
      eventType === "CANCELED"
    ) {
      return Filter.CLOSED;
    }
    return Filter.WAITING_PAYMENT;
  }, [eventType]);

  const navigateToOrder = useCallback(() => {
    if (!orderId) return;
    navigate("MyOrders", { orderId, filter: targetFilter, showDetails: true });
    onNavigate?.();
  }, [navigate, onNavigate, orderId, targetFilter]);

  const handleCardClick = useCallback(() => {
    void onClick?.();
  }, [onClick]);

  return (
    <div
      className={`relative flex items-stretch ${
        isRead
          ? "bg-white border border-gray-200"
          : "bg-white border border-secondary"
      } rounded-xl shadow-sm ${compact ? "p-2" : "p-3"} ${
        onClick ? "cursor-pointer hover:bg-secondary/10" : ""
      } ${className || ""}`}
      onClick={onClick ? handleCardClick : undefined}
      role={onClick ? "button" : undefined}
    >
      {/* Main content */}
      <div className="flex-1 min-w-0 pr-10 font-secondary">
        {/* 1) Event type / Title */}
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm text-gray-900 ${
              isEvent ? "font-semibold" : "font-medium"
            } ${compact ? "line-clamp-2" : "line-clamp-3"}`}
          >
            {title}
          </p>
          <p className="text-xs text-gray-500 whitespace-nowrap">{dateLabel}</p>
        </div>

        {/* 2) Text + button to navigate to order */}
        <div className="mt-2">
          <p className="text-xs text-gray-600 line-clamp-2">
            {isEvent ? eventSubtitle : ""}
          </p>

          {canNavigateToOrder && (
            <div className="mt-2 w-full">
              <Button
                size="sm"
                variant="outline"
                className={
                  compact
                    ? `h-7 px-2 text-xs w-full ${
                        isRead
                          ? "border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200"
                          : "border-primary/50"
                      }`
                    : `w-full text-xs ${
                        isRead
                          ? "border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200"
                          : "bg-secondary/50 border text-dark hover:bg-secondary/80"
                      }`
                }
                onClick={(e) => {
                  e.stopPropagation();
                  void onClick?.();
                  navigateToOrder();
                }}
              >
                {t("view_order") || "View order"}
              </Button>
            </div>
          )}
        </div>

        {/* 3) Order id (small) */}
        {orderId && (
          <p className="text-[10px] font-secondary text-dark pb-1 mt-2 break-all">
            {t("order_id") || "Order ID"}: {orderId}
          </p>
        )}
      </div>

      {/* Right ticket */}
      <div
        className={`absolute top-0 right-0 h-full w-10 flex items-center justify-center rounded-r-xl ${
          isRead ? "bg-gray-200" : "bg-secondary/10"
        }`}
        aria-label={isRead ? "read" : "unread"}
      >
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center ${
            isRead ? "bg-gray-400 text-white" : "bg-secondary/80 text-white"
          }`}
        >
          <Check className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default NotificationCard;
