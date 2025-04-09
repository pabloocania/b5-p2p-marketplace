import React from "react";
import { useTranslation } from "react-i18next";
import { format, formatDistanceToNow } from "date-fns";
import { Calendar } from "lucide-react";
import { i18n } from "@rainbow-me/rainbowkit/dist/locales";
import { es, enUS } from "date-fns/locale";

interface OrderCreatedDateProps {
  readonly createdAt: string;
  readonly status: string;
}

const OrderCreatedDate: React.FC<OrderCreatedDateProps> = ({
  createdAt,
  status,
}) => {
  if (!createdAt) return null;

  const finalStates = [
    "RELEASED",
    "CLOSED",
    "CANCELED",
    "CANCELED_BY_ADMIN",
    "COMPLETED_BY_ADMIN",
  ] as const;

  const { t, i18n } = useTranslation();
  const formattedDate = format(new Date(createdAt), "dd-MM-yy - HH:mm");

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    locale: i18n.language === "es" ? es : enUS,
    addSuffix: true,
  });

  return (
    <div className="flex justify-end items-center text-xxs w-full text-gray-500 pb-1">
      <Calendar className="w-3 h-2 mr-1" />
      {finalStates.includes(status as (typeof finalStates)[number]) ? (
        <span>
          {t("created")} {formattedDate}
        </span>
      ) : (
        <span>{timeAgo}</span>
      )}
    </div>
  );
};

export default OrderCreatedDate;
