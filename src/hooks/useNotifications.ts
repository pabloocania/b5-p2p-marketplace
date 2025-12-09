"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { p2pMarketAPIClient as client } from "@/lib/APIClients";
import { createNotificationsService, getNotificationsService, NotificationsServiceImpl } from "@/lib/NotificationsService";
import { Message } from "b5-api-client";
import { NotificationDto } from "b5-api-client";
import { useKioscoinUserContext } from "@/components/kioscoin/users/KioscoinUserContext";
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
    const { loginId } = useKioscoinUserContext();
    const notificationsServiceRef = useRef<NotificationsServiceImpl | null>(null);
    const isSettingUpRef = useRef(false); // Prevent multiple simultaneous setups

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
            setIsConnected(false);
            isSettingUpRef.current = false; // Reset setup flag when logged out
            return;
        }

        // Prevent multiple simultaneous setups
        if (isSettingUpRef.current) {
            console.log('[useNotifications] Setup already in progress, skipping');
            return;
        }

        // Check if we already have a connected service
        const existingService = getNotificationsService();
        if (existingService?.isConnected()) {
            console.log('[useNotifications] WebSocket already connected, skipping setup');
            setIsConnected(true);
            fetchNotifications();
            return;
        }

        isSettingUpRef.current = true;

        // Fetch initial notifications
        fetchNotifications();

        // Initialize WebSocket connection
        const setupWebSocket = async () => {
            try {
                console.log('[useNotifications] Setting up WebSocket connection...');

                // Try to establish/refresh session with the backend
                const sessionData = await client.createSession({ idToken: loginId });

                if (!sessionData.success) {
                    console.error('[useNotifications] Session creation unsuccessful');
                    setIsConnected(false);
                    isSettingUpRef.current = false;
                    return;
                }

                console.log('[useNotifications] Session established successfully');

                // Now connect to WebSocket (session cookie will be sent automatically)
                let service = getNotificationsService();

                if (!service) {
                    service = createNotificationsService({
                        baseUrl: apiBaseUrl,
                    });
                    notificationsServiceRef.current = service;
                }

                if (!service.isConnected()) {
                    service.connect(handleNewMessage);
                    setIsConnected(true);
                } else {
                    console.log('[useNotifications] Service already connected');
                    setIsConnected(true);
                }
            } catch (err) {
                console.error('[useNotifications] WebSocket setup error:', err);
                setIsConnected(false);
            } finally {
                isSettingUpRef.current = false;
            }
        };

        setupWebSocket();

        // Cleanup
        return () => {
            // Note: We keep the WebSocket connection alive for real-time updates
            // Don't disconnect on unmount unless needed
        };
    }, [loginId, apiBaseUrl]); // Removed function dependencies to prevent re-runs

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
