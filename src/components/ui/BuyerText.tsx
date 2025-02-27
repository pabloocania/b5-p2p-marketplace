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
    <div className="flex flex-col items-center">
      <p className="text-left w-full text-xs text-primary">
        {t("buyer")}:{" "}
        <span className="text-xs text-primary font-bold">
          {order.buyerId === userId
            ? t("you")
            : order.buyerUsername
            ? order.buyerUsername
            : order.buyerId}
        </span>
      </p>
      {!order.buyerHasRated &&
        order.status &&
        finishedStatusesList.includes(order.status) && (
          <div className="flex justify-center w-full">
            <Rating
              orderId={order.id!!}
              ratedId={order.buyerId ? order.buyerId : ""}
            />
          </div>
        )}
    </div>
  );
};
