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
    event: OrderEvent; // You'll need to define this interface as well
}

export interface ChatMessage {
    sender: string;
    timestamp: number;
    content: ChatMessageContentText | ChatMessageContentAction | ChatMessageContentEvent;
}

export class ChatWebSocketClient {
    private socket: WebSocket | null = null;
    private chatId: string;
    private participantId: string;
    private onMessageCallback: (message: ChatMessage) => void;

    constructor(chatId: string, participantId: string, onMessageCallback: (message: any) => void) {
        this.chatId = chatId;
        this.participantId = participantId;
        this.onMessageCallback = onMessageCallback;
    }

    connect() {
        const host = process.env.NEXT_PUBLIC_KIOSCOIN_WEBSOCKET_URL ?? "wss://bolsillo-argento-586dfd80364d.herokuapp.com"
        const url = `${host}/api/chat?chatId=${this.chatId}&participantId=${this.participantId}`;
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log("WebSocket connection established");
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.onMessageCallback(message);
        };

        this.socket.onclose = (event) => {
            console.log("WebSocket connection closed", event);
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error", error);
        };
    }

    sendMessage(message: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error("WebSocket is not open. Ready state: ", this.socket?.readyState);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}