"use client";
import { useState } from "react";
import { Order, KioscoinUser } from "b5-api-client";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Button } from "../../ui/button";

interface ChatButtonProps {
  order: Order;
  user: KioscoinUser | undefined;
}

function isOrderCompleted(status: string): boolean {
  const completedStatuses = [
    "COMPLETED",
    "COMPLETED_BY_ADMIN",
    "RELEASED",
    "CANCELLED",
  ];
  return completedStatuses.includes(status);
}

export default function ChatButton({ order, user }: ChatButtonProps) {
  const { t } = useTranslation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);

  const handleChatIconClick = () => {
    setIsChatOpen(true);
    setHasUnreadMessage(false);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  // Don't show button if no chatId or order is completed
  if (!order.chatId || isOrderCompleted(order.status ?? "")) {
    return null;
  }

  return (
    <Sheet
      open={isChatOpen}
      onOpenChange={(open) => {
        setIsChatOpen(open);
        if (!open) handleChatClose();
      }}
    >
      <SheetTrigger asChild>
        <Button
          onClick={handleChatIconClick}
          className={`w-full h-full rounded-md bg-white text-primary border font-secondary ${
            hasUnreadMessage
              ? "border-primary/50 ring-2 ring-primary animate-pulse"
              : "border-primary/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={18} />
            <span className="text-sm">{t("chat")}</span>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[75vh]" closeText="">
        <SheetTitle></SheetTitle>
        <ChatInterface
          order={order}
          userId={user?.id}
          onIncomingMessage={() => {
            if (!isChatOpen) setHasUnreadMessage(true);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
