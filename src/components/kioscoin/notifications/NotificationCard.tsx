"use client";

import React from "react";
import { Check } from "lucide-react";
import {
  NotificationDto,
  MessageContentEvent,
  MessageContent,
} from "b5-api-client";
import { getEventTypeTranslationKey } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface NotificationCardProps {
  notification: NotificationDto;
  onClick?: () => void;
  className?: string;
  // When shown inside a toast, we want a tighter layout
  compact?: boolean;
}

export function NotificationCard({
  notification,
  onClick,
  className,
  compact = false,
}: NotificationCardProps) {
  const { t } = useTranslation();
  const isRead = Boolean(notification.readAt);

  const content = notification.message?.content as MessageContent | undefined;
  const isEvent = content?.type === "EVENT";
  let eventOrderId: string | undefined;
  let eventType: string | undefined;
  if (content && content.type === "EVENT") {
    const eventContent = content as MessageContentEvent;
    eventOrderId = eventContent.event.orderId;
    eventType = eventContent.event.eventType;
  }
  const getPreview = (): string => {
    if (notification.message?.content?.type === "TEXT") {
      return notification.message.content.text;
    }
    return "Notification";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className={`relative flex items-stretch bg-white border border-primary rounded-xl shadow-sm ${
        compact ? "p-3" : "p-4"
      } ${onClick ? "cursor-pointer hover:bg-gray-50" : ""} ${className || ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {/* Main content */}
      <div className="flex-1 min-w-0 pr-10 font-secondary">
        {isEvent ? (
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {t(getEventTypeTranslationKey(eventType ?? ""))} -{" "}
              {formatDate(notification.createdAt)}
            </p>
            <p className="text-xs text-gray-500 mt-1"></p>
            {eventOrderId && (
              <p className="text-xs text-gray-700 mt-1">ID: {eventOrderId}</p>
            )}
          </div>
        ) : (
          <div>
            <p
              className={`text-sm font-medium text-gray-900 ${
                compact ? "line-clamp-2" : "line-clamp-3"
              }`}
            >
              {getPreview()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(notification.createdAt)}
            </p>
          </div>
        )}
      </div>

      {/* Right ticket */}
      <div
        className={`absolute top-0 right-0 h-full w-10 flex items-center justify-center rounded-r-xl ${
          isRead ? "bg-secondary/10" : "bg-gray-200"
        }`}
        aria-label={isRead ? "read" : "unread"}
      >
        <div
          className={`h-6 w-6 rounded-full flex items-center justify-center ${
            isRead ? "bg-secondary/80 text-white" : "bg-gray-400 text-white"
          }`}
        >
          <Check className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default NotificationCard;
