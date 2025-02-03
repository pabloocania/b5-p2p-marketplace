// OrderCardHeader.tsx
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { StarRating } from "@/components/ui/RatingCounter";
import { CryptoIcon } from "./CryptoIcon";

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
      <div className="flex-[0_0_75%]">
       <CardTitle className="flex flex-col gap-2 mt-2">
          <div className="flex flex-row gap-1"><span className="font-extrabold">
            {order.type === "SELL" ? order.sellerUsername : order.buyerUsername}
          </span>{" "}<span className="m-1 mx-2"> <StarRating rating={5} transactionCount={22}/>  </span></div>
          <div className="flex flex-row gap-5">
          <span className="font-bold text-m justify-center items-center">
           <i>{order.type === "SELL" ? t("sells") : t("buys")}</i> 
          </span>{" "}
          <span className="text-m justify-center items-center mt-0.5">
            <CryptoIcon  amount={3} tokenCode="pdoc" />
          </span>
          </div>
        </CardTitle>
      </div>
      <div className="flex-[0_0_25%] flex justify-end h-6">
        <div className="w-full max-w-full text-right">
          <Badge
            className={`text-xs ${mapOrderVariant(order)} whitespace-normal`}
          >
            {mapOrderStatus(order.status ?? "Unknown")}
          </Badge>
        </div>
      </div>
    </CardHeader>
  );
};

export default OrderCardHeader;
