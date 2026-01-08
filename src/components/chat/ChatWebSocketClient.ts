import { OrderEvent } from "b5-api-client";

// Base interface for all message content types
export interface ChatMessageContent {
    type: 'TEXT' | 'ACTION' | 'EVENT';
}

export interface ChatMessageContentText extends ChatMessageContent {
    type: 'TEXT';
    text: string;
}

export interface ChatMessageContentAction extends ChatMessageContent {
    type: 'ACTION';
    content: string;
}

export interface ChatMessageContentEvent extends ChatMessageContent {
    type: 'EVENT';
    event: OrderEvent;
}

export interface ChatMessage {
    sender: string;
    timestamp: number;
    content: ChatMessageContentText | ChatMessageContentAction | ChatMessageContentEvent;
}

export type ChatConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'unavailable';

export interface ChatStatusListener {
    (status: ChatConnectionStatus): void;
}

export class ChatWebSocketClient {
    private socket: WebSocket | null = null;
    private chatId: string;
    private participantId: string;
    private onMessageCallback: (message: ChatMessage) => void;
    private statusListeners: Set<ChatStatusListener> = new Set();

    // Reconnection configuration
    private reconnectAttempts = 0;
    private readonly baseReconnectDelay = 1000;
    private readonly maxReconnectDelay = 30000;
    private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;

    private isManuallyClosing = false;
    private connectionStatus: ChatConnectionStatus = 'disconnected';

    constructor(chatId: string, participantId: string, onMessageCallback: (message: any) => void) {
        this.chatId = chatId;
        this.participantId = participantId;
        this.onMessageCallback = onMessageCallback;
        this.setupNetworkListeners();
    }

    /**
     * Subscribe to connection status changes.
     */
    onStatusChange(listener: ChatStatusListener): () => void {
        this.statusListeners.add(listener);
        listener(this.connectionStatus);
        return () => this.statusListeners.delete(listener);
    }

    private setStatus(status: ChatConnectionStatus): void {
        if (this.connectionStatus !== status) {
            this.connectionStatus = status;
            this.statusListeners.forEach(listener => listener(status));
        }
    }

    private setupNetworkListeners(): void {
        if (typeof window === 'undefined') return;

        window.addEventListener('online', () => {
            if (!this.isConnected() && !this.isManuallyClosing) {
                this.reconnectAttempts = 0;
                this.attemptReconnect();
            }
        });

        window.addEventListener('offline', () => {
            this.cancelPendingReconnect();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                if (!this.isConnected() && !this.isManuallyClosing) {
                    this.reconnectAttempts = 0;
                    this.attemptReconnect();
                }
            }
        });
    }

    connect() {
        // Prevent duplicate connections
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        this.isManuallyClosing = false;
        this.setStatus('connecting');

        const host = process.env.NEXT_PUBLIC_KIOSCOIN_WEBSOCKET_URL ?? "wss://bolsillo-argento-586dfd80364d.herokuapp.com"
        const url = `${host}/api/chat?chatId=${this.chatId}&participantId=${this.participantId}`;

        try {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log("[ChatWebSocket] Connection established");
                this.reconnectAttempts = 0;
                this.setStatus('connected');
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.onMessageCallback(message);
                } catch (error) {
                    console.error("[ChatWebSocket] Error parsing message:", error);
                }
            };

            this.socket.onclose = (event) => {
                this.setStatus('disconnected');

                // Don't retry on specific failures
                const noRetryReasons = [
                    'Chat session not found',
                    'participant mismatch',
                    'session full',
                ];
                const shouldNotRetry =
                    this.isManuallyClosing ||
                    event.code === 1008 || // Auth failure
                    event.code === 1003 || // Unsupported data (often used for "not found")
                    noRetryReasons.some(reason => event.reason?.includes(reason));

                if (shouldNotRetry) {
                    // Mark as unavailable if the session doesn't exist
                    if (event.reason?.includes('Chat session not found') || event.code === 1003) {
                        this.setStatus('unavailable');
                    }
                    return;
                }

                this.attemptReconnect();
            };

            this.socket.onerror = (error) => {
                console.error("[ChatWebSocket] Error", error);
            };
        } catch (error) {
            console.error("[ChatWebSocket] Connection error:", error);
            this.setStatus('disconnected');
            this.attemptReconnect();
        }
    }

    private cancelPendingReconnect(): void {
        if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }
    }

    private attemptReconnect(): void {
        this.cancelPendingReconnect();

        if (this.isManuallyClosing) return;
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return;
        }

        this.reconnectAttempts++;

        // Exponential backoff with jitter
        const exponentialDelay = Math.min(
            this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );
        const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
        const delay = Math.round(exponentialDelay + jitter);

        this.setStatus('reconnecting');

        this.reconnectTimeoutId = setTimeout(() => {
            this.connect();
        }, delay);
    }

    sendMessage(message: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error("[ChatWebSocket] Not open. Ready state:", this.socket?.readyState);
        }
    }

    disconnect() {
        this.isManuallyClosing = true;
        this.cancelPendingReconnect();
        if (this.socket) {
            if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
                this.socket.close();
            }
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

    getStatus(): ChatConnectionStatus {
        return this.connectionStatus;
    }
}
