import { Message } from 'b5-api-client';

export interface NotificationsServiceConfig {
    baseUrl: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface ConnectionStatusListener {
    (status: ConnectionStatus): void;
}

export class NotificationsServiceImpl {
    private socket: WebSocket | null = null;
    private messageCallback: (message: Message) => void = () => { };
    private statusListeners: Set<ConnectionStatusListener> = new Set();

    // Reconnection configuration
    private reconnectAttempts = 0;
    private readonly baseReconnectDelay = 1000; // Start with 1 second
    private readonly maxReconnectDelay = 30000; // Max 30 seconds between attempts
    private readonly maxReconnectAttempts = Infinity; // Unlimited retries
    private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;

    private config: NotificationsServiceConfig;
    private isManuallyClosing = false;
    private lastConnectedAt: number | null = null;
    private connectionStatus: ConnectionStatus = 'disconnected';

    // Session refresh callback (to be set by consumer)
    private sessionRefreshCallback: (() => Promise<boolean>) | null = null;

    constructor(config: NotificationsServiceConfig) {
        this.config = config;
        this.setupNetworkListeners();
    }

    /**
     * Set a callback to refresh the session before reconnecting.
     * Should return true if session refresh was successful.
     */
    setSessionRefreshCallback(callback: () => Promise<boolean>): void {
        this.sessionRefreshCallback = callback;
    }

    /**
     * Subscribe to connection status changes.
     */
    onStatusChange(listener: ConnectionStatusListener): () => void {
        this.statusListeners.add(listener);
        // Immediately notify of current status
        listener(this.connectionStatus);
        return () => this.statusListeners.delete(listener);
    }

    private setStatus(status: ConnectionStatus): void {
        if (this.connectionStatus !== status) {
            this.connectionStatus = status;
            console.log(`[NotificationsService] Status changed: ${status}`);
            this.statusListeners.forEach(listener => listener(status));
        }
    }

    private setupNetworkListeners(): void {
        if (typeof window === 'undefined') return;

        // When browser comes back online, attempt to reconnect
        window.addEventListener('online', () => {
            console.log('[NotificationsService] Network online detected');
            if (!this.isConnected() && !this.isManuallyClosing) {
                // Reset attempts on network recovery for fresh start
                this.reconnectAttempts = 0;
                this.attemptReconnect();
            }
        });

        window.addEventListener('offline', () => {
            console.log('[NotificationsService] Network offline detected');
            // Cancel any pending reconnect attempts
            this.cancelPendingReconnect();
        });

        // Handle visibility change - reconnect when tab becomes visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('[NotificationsService] Tab became visible');
                if (!this.isConnected() && !this.isManuallyClosing) {
                    this.reconnectAttempts = 0;
                    this.attemptReconnect();
                }
            }
        });
    }

    connect(onMessage: (message: Message) => void): void {
        // Always update the callback, even if already connected
        this.messageCallback = onMessage;

        // Prevent connecting if already connected or connecting
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            console.log('[NotificationsService] Already connected or connecting, callback updated');
            return;
        }

        this.isManuallyClosing = false;
        this.setStatus('connecting');

        try {
            const wsUrl = this.buildWebSocketUrl();
            console.log('[NotificationsService] Connecting to WebSocket...');

            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('[NotificationsService] WebSocket connected successfully');
                this.reconnectAttempts = 0;
                this.lastConnectedAt = Date.now();
                this.setStatus('connected');
            };

            this.socket.onmessage = (event: MessageEvent) => {
                try {
                    const message = JSON.parse(event.data) as Message;
                    this.messageCallback(message);
                } catch (error) {
                    console.error('[NotificationsService] Error parsing message:', error);
                }
            };

            this.socket.onerror = (error: Event) => {
                console.error('[NotificationsService] WebSocket error:', error);
            };

            this.socket.onclose = (event: CloseEvent) => {
                console.log('[NotificationsService] Connection closed', event.code, event.reason);
                this.setStatus('disconnected');

                // Check close code - don't retry on authentication failures
                if (event.code === 1008) { // VIOLATED_POLICY = auth failure
                    console.error('[NotificationsService] Authentication failed - session invalid');
                    // Could trigger a re-login flow here
                    return;
                }

                if (!this.isManuallyClosing) {
                    this.attemptReconnect();
                }
            };
        } catch (error) {
            console.error('[NotificationsService] Connection error:', error);
            this.setStatus('disconnected');
            if (!this.isManuallyClosing) {
                this.attemptReconnect();
            }
        }
    }

    private cancelPendingReconnect(): void {
        if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }
    }

    private async attemptReconnect(): Promise<void> {
        // Cancel any existing reconnect attempt
        this.cancelPendingReconnect();

        // Don't reconnect if manually closing or offline
        if (this.isManuallyClosing) return;
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            console.log('[NotificationsService] Offline - waiting for network');
            return;
        }

        this.reconnectAttempts++;

        // Calculate delay with exponential backoff and jitter
        const exponentialDelay = Math.min(
            this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );
        // Add jitter (±25%) to prevent thundering herd
        const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
        const delay = Math.round(exponentialDelay + jitter);

        console.log(`[NotificationsService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        this.setStatus('reconnecting');

        this.reconnectTimeoutId = setTimeout(async () => {
            // Check if session needs refresh (disconnected for more than 5 minutes)
            const disconnectedDuration = this.lastConnectedAt
                ? Date.now() - this.lastConnectedAt
                : Infinity;

            if (disconnectedDuration > 5 * 60 * 1000 && this.sessionRefreshCallback) {
                console.log('[NotificationsService] Long disconnection - refreshing session first');
                try {
                    const success = await this.sessionRefreshCallback();
                    if (!success) {
                        console.error('[NotificationsService] Session refresh failed');
                        // Continue anyway - the WebSocket might still work
                    }
                } catch (error) {
                    console.error('[NotificationsService] Session refresh error:', error);
                }
            }

            this.connect(this.messageCallback);
        }, delay);
    }

    disconnect(): void {
        this.isManuallyClosing = true;
        this.cancelPendingReconnect();
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.setStatus('disconnected');
    }

    isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
    }

    isConnecting(): boolean {
        return this.socket?.readyState === WebSocket.CONNECTING;
    }

    getStatus(): ConnectionStatus {
        return this.connectionStatus;
    }

    getReconnectAttempts(): number {
        return this.reconnectAttempts;
    }

    private buildWebSocketUrl(): string {
        const host = process.env.NEXT_PUBLIC_KIOSCOIN_WEBSOCKET_URL ?? "wss://bolsillo-argento-586dfd80364d.herokuapp.com";
        return `${host}/api/notifications/ws`;
    }
}

// Singleton instance
let instance: NotificationsServiceImpl | null = null;

export function createNotificationsService(config: NotificationsServiceConfig): NotificationsServiceImpl {
    if (!instance) {
        instance = new NotificationsServiceImpl(config);
    }
    return instance;
}

export function getNotificationsService(): NotificationsServiceImpl | null {
    return instance;
}

export function destroyNotificationsService(): void {
    if (instance) {
        instance.disconnect();
        instance = null;
        console.log('[NotificationsService] Service destroyed');
    }
}
