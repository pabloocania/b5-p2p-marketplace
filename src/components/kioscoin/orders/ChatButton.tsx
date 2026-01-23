"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Order, KioscoinUser } from "b5-api-client";
import { MessageCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { IconButton } from "@/components/ui/IconButton";
import {
  ChatMessage,
  ChatWebSocketClient,
  ChatConnectionStatus,
} from "@/components/chat/ChatWebSocketClient";

interface ChatButtonProps {
  order: Order;
  user: KioscoinUser | undefined;
}

function isOrderCompleted(status: string): boolean {
  const completedStatuses = [
    "COMPLETED",
    "COMPLETED_BY_ADMIN",
    "RELEASED",
    "CANCELED",
  ];
  return completedStatuses.includes(status);
}

export default function ChatButton({ order, user }: ChatButtonProps) {
  const { t } = useTranslation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ChatConnectionStatus>("disconnected");
  const clientRef = useRef<ChatWebSocketClient | null>(null);
  const isChatOpenRef = useRef(isChatOpen);
  const messageCallbacksRef = useRef<Set<(message: ChatMessage) => void>>(
    new Set()
  );

  // Keep ref in sync with state
  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  // Maintain a single WebSocket connection that stays active
  useEffect(() => {
    if (order.chatId && user?.id && !isOrderCompleted(order.status ?? "")) {
      // Check if we already have an active connection for this chat
      const existingClient = clientRef.current;
      if (
        existingClient &&
        (existingClient.isConnected() || existingClient.isConnecting())
      ) {
        console.log(
          "[ChatButton] WebSocket already connected/connecting, skipping"
        );
        return;
      }

      const client = new ChatWebSocketClient(
        order.chatId,
        user.id,
        (message: ChatMessage) => {
          // Update messages state
          setMessages((prevMessages) => [...prevMessages, message]);

          // Handle unread indicator: show if chat is closed and message is from someone else
          if (!isChatOpenRef.current && message.sender !== user.id) {
            setHasUnreadMessage(true);
          }

          // Notify all registered callbacks (e.g., ChatInterface)
          messageCallbacksRef.current.forEach((callback) => {
            callback(message);
          });
        }
      );

      // Subscribe to connection status changes
      const unsubscribe = client.onStatusChange(setConnectionStatus);

      client.connect();
      clientRef.current = client;

      return () => {
        unsubscribe();
        client.disconnect();
        clientRef.current = null;
        setMessages([]);
        setConnectionStatus("disconnected");
        messageCallbacksRef.current.clear();
      };
    }
  }, [order.chatId, user?.id, order.status]);

  const handleChatIconClick = () => {
    setIsChatOpen(true);
    setHasUnreadMessage(false);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  // Register a callback to receive messages (used by ChatInterface)
  const registerMessageCallback = useCallback(
    (callback: (message: ChatMessage) => void) => {
      messageCallbacksRef.current.add(callback);
      return () => {
        messageCallbacksRef.current.delete(callback);
      };
    },
    []
  );

  // Don't show button if no chatId or order is completed
  if (!order.chatId || isOrderCompleted(order.status ?? "")) {
    return null;
  }

  const isChatUnavailable = connectionStatus === "unavailable";

  return (
    <div className="flex flex-col items-center w-full">
      <Sheet
        open={isChatOpen}
        onOpenChange={(open) => {
          if (isChatUnavailable) return; // Prevent opening if unavailable
          setIsChatOpen(open);
          if (open) {
            setHasUnreadMessage(false);
          } else {
            handleChatClose();
          }
        }}
      >
        <SheetTrigger asChild>
          <div className="relative w-full">
            <IconButton
              icon={isChatUnavailable ? AlertCircle : MessageCircle}
              iconClassName="h-[18px] w-[18px]"
              className={`font-secondary border-primary/50 bg-white text-primary hover:bg-secondary/20 w-full justify-center transition-all ${
                hasUnreadMessage ? "animate-unread-glow" : ""
              } ${isChatUnavailable ? "opacity-50 cursor-not-allowed" : ""}`}
              variant="outline"
              size="sm"
              onClick={isChatUnavailable ? undefined : handleChatIconClick}
              label={t("chat")}
              disabled={isChatUnavailable}
            />
            {hasUnreadMessage && !isChatUnavailable && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-secondary"></span>
            )}
          </div>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[75vh]" closeText="">
          <SheetTitle></SheetTitle>
          <ChatInterface
            order={order}
            userId={user?.id}
            client={clientRef.current}
            initialMessages={messages}
            onRegisterMessageCallback={registerMessageCallback}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
