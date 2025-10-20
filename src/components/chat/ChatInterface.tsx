import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ChatMessage,
  ChatWebSocketClient,
  ChatMessageContentText,
  ChatMessageContentAction,
} from "./ChatWebSocketClient"; // Import the WebSocket client
import { Order } from "b5-api-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatEventType } from "@/lib/utils";

interface ChatInterfaceProps {
  userId: string | undefined;
  order: Order; // Add Order to props
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userId,
  order,
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [client, setClient] = useState<ChatWebSocketClient | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (order.chatId && userId) {
      const chatClient = new ChatWebSocketClient(
        order.chatId,
        userId,
        (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      );

      chatClient.connect();
      setClient(chatClient);

      return () => {
        chatClient.disconnect(); // Ensure WebSocket is disconnected on unmount
        setMessages([]); // Clear messages when the chat is closed
      };
    }
  }, [order.chatId, userId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && client) {
      const message: ChatMessage = {
        sender: userId!,
        timestamp: Date.now(),
        content: { type: "TEXT", text: newMessage },
      };
      client.sendMessage(message);
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    }
  };

  const getUsername = (senderId: string): string => {
    if (senderId === order.buyerId) {
      return order.buyerUsername || senderId;
    } else if (senderId === order.sellerId) {
      return order.sellerUsername || senderId;
    }
    return "Unknown";
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const hasOrderReleasedOrRefunded = useMemo(() => {
    return messages.some(
      (msg) =>
        msg.sender === "ADMIN" &&
        msg.content.type === "EVENT" &&
        (msg.content.event.eventType === "RELEASED" ||
          msg.content.event.eventType === "REFUNDED")
    );
  }, [messages]);

  return (
    <div className="flex flex-col h-full pt-3">
      <div className="flex-1 overflow-y-auto py-2 space-y-4 bg-secondary bg-opacity-10 rounded-lg rounded-xs p-2">
        {messages.map((msg) => {
          // Handle admin event messages
          if (msg.sender === "ADMIN" && msg.content.type === "EVENT") {
            return (
              <div
                key={msg.timestamp}
                className="w-full flex flex-col items-center"
              >
                <div className="bg-terciary py-2 rounded-md w-full">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-md text-muted-foreground text-white">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                    <span className="text-md text-muted-foreground text-white">
                      -
                    </span>
                    <span className="text-md font-semibold text-white">
                      {formatEventType(msg.content.event.eventType)}
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // Handle regular user messages
          return (
            <div
              key={msg.timestamp}
              className={`flex flex-col max-w-[80%] ${
                msg.sender === userId
                  ? "ml-auto items-end"
                  : "mr-auto items-start"
              }`}
            >
              <p className="text-primary font-bold">
                {msg.sender === userId
                  ? t("you") + ":"
                  : "@" + getUsername(msg.sender) + ":"}
              </p>
              <div
                className={`px-3 py-2 rounded-md ${
                  msg.sender === userId
                    ? "bg-secondary bg-opacity-50 text-primary"
                    : "bg-secondary bg-opacity-20 text-primary"
                }`}
              >
                {msg.content.type === "TEXT"
                  ? (msg.content as ChatMessageContentText).text
                  : (msg.content as ChatMessageContentAction).content}
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {formatTimestamp(msg.timestamp)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Prewritten Messages */}
      {/* <div className="py-2 border-t overflow-x-auto">
        <div className="flex gap-2 flex-wrap">
          {prewrittenMessages[userRole as keyof typeof prewrittenMessages].map(
            (message, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs whitespace-nowrap"
                onClick={() => handlePrewrittenMessage(message)}
              >
                {message}
              </Button>
            )
          )}
        </div>
      </div> */}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="pt-4 mb-4 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t("write_message")}
          className="flex-1 border border-terciary"
          disabled={hasOrderReleasedOrRefunded}
        />
        <Button
          className="border-opacity-100 bg-white text-terciary border border-terciary"
          type="submit"
          size="icon"
          disabled={!newMessage.trim() || hasOrderReleasedOrRefunded}
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};
