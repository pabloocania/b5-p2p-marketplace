// OrderCardHeader.tsx
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { UserStats } from "@/components/ui/UserStats";

interface OrderCardHeaderProps {
  order: Order;
}

const OrderCardHeader: React.FC<OrderCardHeaderProps> = ({ order }) => {
  const { t } = useTranslation();

  function mapOrderVariant(order: Order): string {
    switch (order.status) {
      case "PENDING":
        return "bg-secondary text-white";
      case "WAITING_PAYMENT":
        return "bg-yellow-500 text-white";
      case "ACTIVE":
        return "bg-yellow-500 text-white";
      case "FIAT_SENT":
        return "bg-yellow-500 text-white";
      case "SUCCESS":
      case "COMPLETED_BY_ADMIN":
      case "RELEASED":
        return "bg-secondary text-white";
      case "CANCELED":
      case "CANCELED_BY_ADMIN":
        return "bg-gray-300 text-black";
      case "DISPUTE":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  }

  function mapOrderStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      WAITING_PAYMENT: t("waiting_lock"),
      ACTIVE: t("awaiting_buyer"),
      PENDING: t("open"),
      FIAT_SENT: t("waiting_release"),
      // Add other status mappings as needed
      COMPLETED: t("completed"),
      COMPLETED_BY_ADMIN: t("completed"),
      RELEASED: t("completed"),
      CANCELLED: t("canceled"),
      // Add more mappings here
    };
    return statusMap[status] ?? "Unknown";
  }

  return (
    <CardHeader>
      <CardTitle className="flex w-full items-center">
        {/* Left Side */}
        <div className="flex space-x-2 w-full">
          <div className="flex space-x-2 w-full items-center">
            <span className="font-bold text-[clamp(1.2rem,2vw,1.3rem)] text-terciary w-full">
              {order.type === "SELL"
                ? "@" + order.sellerUsername
                : "@" + order.buyerUsername}
            </span>
            <UserStats
              rating={order.creatorRating}
              transactionCount={Number(order.transactionsCount)}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col items-end">
          <div className="text-right mb-1 ml-2">
            <Badge className={`text-xs ${mapOrderVariant(order)}`}>
              {mapOrderStatus(order.status ?? "Unknown")}
            </Badge>
          </div>
        </div>
      </CardTitle>
    </CardHeader>
  );
};

export default OrderCardHeader;
