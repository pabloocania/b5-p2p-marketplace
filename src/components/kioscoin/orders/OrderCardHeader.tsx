// OrderCardHeader.tsx
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { UserInfoCard } from "../users/UserInfoCard";

interface OrderCardHeaderProps {
  order: Order;
}

const OrderCardHeader: React.FC<OrderCardHeaderProps> = ({ order }) => {
  const { t } = useTranslation();

  function mapOrderVariant(order: Order): string {
    const baseClass = "text-secondary font-bold font-secondary bg-secondary/10";
    switch (order.status) {
      case "PENDING":
        return baseClass;
      case "WAITING_PAYMENT":
        return baseClass;
      case "ACTIVE":
        return baseClass;
      case "FIAT_SENT":
        return baseClass;
      case "SUCCESS":
      case "COMPLETED_BY_ADMIN":
      case "RELEASED":
        return baseClass;
      case "CANCELED":
      case "CANCELED_BY_ADMIN":
        return baseClass;
      case "DISPUTE":
        return baseClass;
      default:
        return baseClass;
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
    <CardHeader className="">
      <CardTitle className="flex w-full items-center">
        {/* Left Side */}
        <div className="flex space-x-2 w-full h-full">
          <UserInfoCard order={order} user={undefined} />
        </div>

        {/* Right Side */}
        <div className="flex flex-col items-end justify-center h-full">
          <div className="text-right ml-2 h-full flex items-center">
            <Badge
              className={`text-xs ${mapOrderVariant(
                order
              )} h-full flex items-center px-3`}
            >
              {mapOrderStatus(order.status ?? "Unknown")}
            </Badge>
          </div>
        </div>
      </CardTitle>
    </CardHeader>
  );
};

export default OrderCardHeader;
