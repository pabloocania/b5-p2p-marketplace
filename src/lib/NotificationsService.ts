import { Message } from 'b5-api-client';

export interface NotificationsServiceConfig {
    baseUrl: string;
    loginId: string;
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
        this.messageCallback = onMessage;
        this.isManuallyClosing = false;

        try {
            const wsUrl = this.buildWebSocketUrl();

            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
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

            this.socket.onclose = () => {
                console.log('[NotificationsService] Connection closed');
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
        const token = encodeURIComponent(this.config.loginId);
        return `${host}/api/notifications/ws?token=${token}`;
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
