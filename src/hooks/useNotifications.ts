"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { p2pMarketAPIClient as client } from "@/lib/APIClients";
import { createNotificationsService, getNotificationsService, NotificationsServiceImpl } from "@/lib/NotificationsService";
import { Message } from "b5-api-client";
import { NotificationDto } from "b5-api-client";
import { useUserContext } from "@/components/kioscoin/users/UserContext";
import { toast } from "@/components/ui/use-toast";
import NotificationCard from "@/components/kioscoin/notifications/NotificationCard";


export interface UseNotificationsResult {
    notifications: NotificationDto[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    refreshNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    isConnected: boolean;
}

export function useNotifications(apiBaseUrl: string): UseNotificationsResult {
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { loginId } = useUserContext();
    const notificationsServiceRef = useRef<NotificationsServiceImpl | null>(null);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {

        try {
            setError(null);
            const response = await client.listNotifications(10, 0, {
                Authorization: `Bearer ${loginId}`,
            });
            console.log("response", response);
            const notificationsList: NotificationDto[] = Array.isArray(response)
                ? (response as NotificationDto[])
                : (response?.notifications ?? []);
            setNotifications(notificationsList);

            // Calculate unread count
            const unread = notificationsList.filter((n: NotificationDto) => !n.readAt).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error('[useNotifications] Error fetching notifications:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
        } finally {
            setIsLoading(false);
        }
    }, [loginId]);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId: string) => {
        if (!loginId) return;

        try {
            await (client as any).markNotificationAsRead(notificationId, {
                Authorization: `Bearer ${loginId}`,
            });

            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, readAt: new Date().toISOString() }
                        : n
                )
            );

            // Update unread count
            const newUnreadCount = notifications.filter(
                n => n.id !== notificationId && !n.readAt
            ).length;
            setUnreadCount(Math.max(0, newUnreadCount));
        } catch (err) {
            console.error('[useNotifications] Error marking as read:', err);
        }
    }, [loginId, notifications]);

    // Handle incoming WebSocket message
    const handleNewMessage = useCallback((message: Message) => {
        // If it's a notification message, add it to the list
        if (message.content?.type === "NOTIFICATION") {
            const notification = message.content.notification as NotificationDto;
            setNotifications(prev => [notification, ...prev]);
            if (!notification.readAt) {
                setUnreadCount(prev => prev + 1);
            }

            toast({
                description: React.createElement(NotificationCard, {
                    notification,
                    compact: true,
                }),
            });
        }
    }, []);

    // Initialize WebSocket connection and fetch initial notifications
    useEffect(() => {
        if (!loginId || !apiBaseUrl) {
            setIsLoading(false);
            return;
        }

        // Fetch initial notifications
        fetchNotifications();

        // Initialize WebSocket connection
        const setupWebSocket = async () => {
            try {
                let service = getNotificationsService();

                if (!service) {
                    service = createNotificationsService({
                        baseUrl: apiBaseUrl,
                        loginId,
                    });
                    notificationsServiceRef.current = service;
                }

                if (!service.isConnected()) {
                    service.connect(handleNewMessage);
                    setIsConnected(true);
                }
            } catch (err) {
                console.error('[useNotifications] WebSocket setup error:', err);
            }
        };

        setupWebSocket();

        // Cleanup
        return () => {
            // Note: We keep the WebSocket connection alive for real-time updates
            // Don't disconnect on unmount unless needed
        };
    }, [loginId, apiBaseUrl, fetchNotifications, handleNewMessage]);

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        refreshNotifications: fetchNotifications,
        markAsRead,
        isConnected,
    };
}
