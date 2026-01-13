import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Configuration for the Telegram support bot.
 * Update this with your LivegramBot username.
 */
const TELEGRAM_SUPPORT_BOT_USERNAME = "soporte_kioscoin_bot";

interface TelegramSupportButtonProps {
  readonly userId: string;
  readonly orderId?: string;
  readonly className?: string;
}

/**
 * Button that opens Telegram to contact support.
 * Uses LivegramBot which forwards messages to the founders group.
 */
const TelegramSupportButton: React.FC<TelegramSupportButtonProps> = ({
  userId,
  orderId,
  className,
}) => {
  const { t } = useTranslation();

  const handleOpenSupport = () => {
    const startParam = orderId ? `${userId}_order_${orderId}` : userId;
    const telegramUrl = `https://t.me/${TELEGRAM_SUPPORT_BOT_USERNAME}?start=${startParam}`;
    window.open(telegramUrl, "_blank");
  };

  return (
    <Button
      variant="outline"
      className={`w-full text-xs font-secondary border-primary text-dark hover:bg-terciary hover:text-primary ${
        className ?? ""
      }`}
      onClick={handleOpenSupport}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {t("support.contact_telegram")}
    </Button>
  );
};

export default TelegramSupportButton;
