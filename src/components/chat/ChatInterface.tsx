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
import { getEventTypeTranslationKey } from "@/lib/utils";

interface ChatInterfaceProps {
  userId: string | undefined;
  order: Order;
  client: ChatWebSocketClient | null;
  initialMessages: ChatMessage[];
  onRegisterMessageCallback?: (
    callback: (message: ChatMessage) => void
  ) => () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userId,
  order,
  client,
  initialMessages,
  onRegisterMessageCallback,
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);

  // Initialize with initial messages when component mounts or when initialMessages first become available
  useEffect(() => {
    if (!hasInitializedRef.current) {
      if (initialMessages.length > 0) {
        setMessages(initialMessages);
        hasInitializedRef.current = true;
      }
    }
  }, [initialMessages]);

  // Register callback to receive messages from the shared WebSocket connection
  useEffect(() => {
    if (onRegisterMessageCallback && userId) {
      const unregister = onRegisterMessageCallback((message: ChatMessage) => {
        setMessages((prevMessages) => {
          // Avoid duplicates by checking timestamp
          const exists = prevMessages.some(
            (msg) => msg.timestamp === message.timestamp
          );
          if (exists) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });
      });

      return unregister;
    }
  }, [onRegisterMessageCallback, userId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && client) {
      const message: ChatMessage = {
        sender: userId!,
        timestamp: Date.now(),
        content: { type: "TEXT", text: newMessage },
      };
      client.sendMessage(message);
      // Message will be added via the callback, but we can optimistically add it
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.timestamp === message.timestamp);
        if (exists) {
          return prev;
        }
        return [...prev, message];
      });
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
    <div className="flex flex-col h-full pt-3 font-secondary">
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
                  <div className="flex items-center justify-center gap-2 text-dark">
                    <span className="text-md">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                    <span className="text-md">-</span>
                    <span className="text-md font-semibold">
                      {t(
                        getEventTypeTranslationKey(msg.content.event.eventType)
                      )}
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
              <p className="text-primary font-secondary">
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
          className="flex-1 border border-terciary font-secondary"
          disabled={hasOrderReleasedOrRefunded}
        />
        <Button
          className="border-opacity-100 bg-white text-secondary border border-secondary"
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
