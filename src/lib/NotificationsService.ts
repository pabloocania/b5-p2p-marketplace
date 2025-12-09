import { Message } from 'b5-api-client';

export interface NotificationsServiceConfig {
    baseUrl: string;
}

export class NotificationsServiceImpl {
    private socket: WebSocket | null = null;
    private messageCallback: (message: Message) => void = () => { };
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000; // 3 seconds
    private config: NotificationsServiceConfig;
    private isManuallyClosing = false;

    constructor(config: NotificationsServiceConfig) {
        this.config = config;
    }

    connect(onMessage: (message: Message) => void): void {
        // Prevent connecting if already connected or connecting
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            console.log('[NotificationsService] Already connected or connecting, skipping');
            return;
        }

        this.messageCallback = onMessage;
        this.isManuallyClosing = false;

        try {
            const wsUrl = this.buildWebSocketUrl();
            console.log('[NotificationsService] Connecting to WebSocket...');

            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('[NotificationsService] WebSocket connected successfully');
                this.reconnectAttempts = 0;
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

                // Check close code - don't retry on authentication failures
                if (event.code === 1008) { // VIOLATED_POLICY = auth failure
                    console.error('[NotificationsService] Authentication failed - session invalid');
                    return;
                }

                if (!this.isManuallyClosing && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.attemptReconnect();
                }
            };
        } catch (error) {
            console.error('[NotificationsService] Connection error:', error);
        }
    }

    private attemptReconnect(): void {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;
        console.log(`[NotificationsService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect(this.messageCallback);
        }, delay);
    }

    disconnect(): void {
        this.isManuallyClosing = true;
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return this.socket?.readyState === WebSocket.OPEN;
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
