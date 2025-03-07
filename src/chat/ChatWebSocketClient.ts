export interface ChatMessage {
    sender: string;
    timestamp: number;
    content: {
        type: string;
        text: string;
    };
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
        const host = process.env.NEXT_PUBLIC_KIOSCOIN_WEBSOCKET_URL ?? "ws://bolsillo-argento-586dfd80364d.herokuapp.com"
        const url = `${host}?chatId=${this.chatId}&participantId=${this.participantId}`;
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