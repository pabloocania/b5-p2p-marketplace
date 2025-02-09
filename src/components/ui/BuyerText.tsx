import { Order, OrderStatus } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { Rating } from "./Rating";

interface BuyerTextProps {
  order: Order;
  userId: string | undefined;
}

export const BuyerText: React.FC<BuyerTextProps> = ({ order, userId }) => {
  const { t } = useTranslation();
  const finishedStatusesList: OrderStatus[] = [
    "RELEASED",
    "CLOSED",
    "CANCELED",
    "SUCCESS",
    "CANCELED_BY_ADMIN",
    "EXPIRED",
    "COMPLETED_BY_ADMIN",
  ];

  return (
    <div>
      <span className="text-xs block text-primary">
        {t("buyer")}:{" "}
        {order.buyerId === userId
          ? t("you")
          : order.buyerUsername
          ? order.buyerUsername
          : order.buyerId}
      </span>
      {!order.sellerHasRated &&
        order.status &&
        finishedStatusesList.includes(order.status) && (
          <Rating
            orderId={order.id!!}
            ratedId={order.buyerId ? order.buyerId : ""}
          />
        )}
    </div>
  );
};
