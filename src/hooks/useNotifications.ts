"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { p2pMarketAPIClient as client } from "@/lib/APIClients";
import { createNotificationsService, getNotificationsService, NotificationsServiceImpl, ConnectionStatus } from "@/lib/NotificationsService";
import { Message } from "b5-api-client";
import { NotificationDto } from "b5-api-client";
import { useKioscoinUserContext } from "@/components/kioscoin/users/KioscoinUserContext";
import { toast } from "@/components/ui/use-toast";
import NotificationCard from "@/components/kioscoin/notifications/NotificationCard";
import { useNavigation } from "@/components/kioscoin/NavigationContext";
import { useKioscoinWallet } from "@/components/web3/AccountAbstraction/KioscoinWalletProvider";


export interface UseNotificationsResult {
    notifications: NotificationDto[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    refreshNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    isConnected: boolean;
    connectionStatus: ConnectionStatus;
}

export function useNotifications(apiBaseUrl: string): UseNotificationsResult {
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const { loginId } = useKioscoinUserContext();
    const { orderRefresh } = useNavigation();
    const { refreshBalances, isReady } = useKioscoinWallet();
    const notificationsServiceRef = useRef<NotificationsServiceImpl | null>(null);
    const isSettingUpRef = useRef(false); // Prevent multiple simultaneous setups

    // Ref to hold the latest orderRefresh.refresh function
    const orderRefreshRef = useRef(orderRefresh.refresh);
    useEffect(() => {
        orderRefreshRef.current = orderRefresh.refresh;
    }, [orderRefresh.refresh]);

    const refreshBalancesRef = useRef(refreshBalances);
    const isReadyRef = useRef(isReady);
    const isRefreshingBalancesRef = useRef(false);
    useEffect(() => {
        refreshBalancesRef.current = refreshBalances;
    }, [refreshBalances]);
    useEffect(() => {
        isReadyRef.current = isReady;
    }, [isReady]);

    const triggerBalancesRefresh = useCallback(() => {
        if (!isReadyRef.current || isRefreshingBalancesRef.current) {
            return;
        }
        isRefreshingBalancesRef.current = true;
        void Promise.resolve()
            .then(() => refreshBalancesRef.current())
            .catch((err) => {
                console.error("[useNotifications] Error refreshing balances:", err);
            })
            .finally(() => {
                isRefreshingBalancesRef.current = false;
            });
    }, []);

    // Ref to hold the latest loginId for session refresh
    const loginIdRef = useRef(loginId);
    useEffect(() => {
        loginIdRef.current = loginId;
    }, [loginId]);

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {

        try {
            setError(null);
            const response = await client.listNotifications(50, 0, {
                Authorization: `Bearer ${loginId}`,
            });
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

    // Handle incoming WebSocket message - uses refs to avoid stale closures
    const handleNewMessage = useCallback((message: Message) => {

        // If it's a notification message, add it to the list
        if (message.content?.type === "NOTIFICATION") {
            const notificationContent = message.content as { type: 'NOTIFICATION'; notification: NotificationDto };
            const notification = notificationContent.notification;

            setNotifications(prev => {
                return [notification, ...prev];
            });

            if (!notification.readAt) {
                setUnreadCount(prev => prev + 1);
            }

            // Trigger order refresh when an order-related event arrives (use ref for latest function)
            const eventContent = notification.message?.content;
            if (eventContent?.type === "EVENT") {
                const event = (eventContent as any)?.event;
                if (event?.orderId || event?.order_id) {
                    orderRefreshRef.current();
                }
                const eventType = event?.eventType ?? event?.event_type;
                if (eventType === "RELEASED") {
                    triggerBalancesRefresh();
                }
            }

            let toastApi: { dismiss: () => void } | undefined;
            toastApi = toast({
                description: React.createElement(NotificationCard, {
                    notification,
                    compact: true,
                    onNavigate: () => toastApi?.dismiss(),
                }),
                className: "w-[420px] max-w-[90vw] !bg-backgroundMain border-primary/20 font-secondary",
            });
        } else {
            console.log('[useNotifications] Message is not a NOTIFICATION type:', message.content?.type);
        }
    }, []); // No dependencies - uses refs for dynamic values

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
            return;
        }

        // Check if we already have a connected or connecting service
        const existingService = getNotificationsService();
        if (existingService?.isConnected()) {
            // Always update the callback to ensure latest state references
            existingService.connect(handleNewMessage);
            setIsConnected(true);
            fetchNotifications();
            return;
        }
        if (existingService?.isConnecting()) {
            fetchNotifications();
            return;
        }

        isSettingUpRef.current = true;

        // Fetch initial notifications
        fetchNotifications();

        // Initialize WebSocket connection
        const setupWebSocket = async () => {
            try {

                // Try to establish/refresh session with the backend
                const sessionData = await client.createSession({ idToken: loginId });

                if (!sessionData.success) {
                    console.error('[useNotifications] Session creation unsuccessful');
                    setIsConnected(false);
                    isSettingUpRef.current = false;
                    return;
                }


                // Now connect to WebSocket (session cookie will be sent automatically)
                let service = getNotificationsService();

                if (!service) {
                    service = createNotificationsService({
                        baseUrl: apiBaseUrl,
                    });
                    notificationsServiceRef.current = service;
                }

                // Set up session refresh callback for long disconnections
                service.setSessionRefreshCallback(async () => {
                    const currentLoginId = loginIdRef.current;
                    if (!currentLoginId) return false;
                    try {
                        const sessionData = await client.createSession({ idToken: currentLoginId });
                        return sessionData.success;
                    } catch {
                        return false;
                    }
                });

                // Subscribe to connection status changes
                const unsubscribe = service.onStatusChange((status) => {
                    setConnectionStatus(status);
                    setIsConnected(status === 'connected');
                });

                if (!service.isConnected() && !service.isConnecting()) {
                    service.connect(handleNewMessage);
                } else {
                    setIsConnected(service.isConnected());
                    setConnectionStatus(service.getStatus());
                }

                // Store unsubscribe for cleanup
                return unsubscribe;
            } catch (err) {
                console.error('[useNotifications] WebSocket setup error:', err);
                setIsConnected(false);
                setConnectionStatus('disconnected');
                return undefined;
            } finally {
                isSettingUpRef.current = false;
            }
        };

        const cleanupPromise = setupWebSocket();

        // Cleanup
        return () => {
            cleanupPromise.then(unsubscribe => {
                if (unsubscribe) unsubscribe();
            });
        };
    }, [loginId, apiBaseUrl, handleNewMessage]); // handleNewMessage is now stable (no deps)

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        refreshNotifications: fetchNotifications,
        markAsRead,
        isConnected,
        connectionStatus,
    };
}
