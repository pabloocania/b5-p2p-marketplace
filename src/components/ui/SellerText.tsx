import { Order, OrderStatus } from "b5-api-client/dist/types";
import { useTranslation } from "react-i18next";
import { Rating } from "./Rating";

interface SellerTextProps {
  order: Order;
  userId: string | undefined;
}

export const SellerText: React.FC<SellerTextProps> = ({ order, userId }) => {
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
    <div className="text-right w-full">
      <p className="text-left w-full text-xs text-primary">
        {t("seller")}:{" "}
        <span className="text-xs text-primary font-bold">
          {order.sellerId === userId
            ? t("you")
            : order.sellerUsername
            ? order.sellerUsername
            : order.sellerId}
        </span>
      </p>
      {!order.buyerHasRated &&
        order.status &&
        finishedStatusesList.includes(order.status) && (
          <Rating
            orderId={order.id!!}
            ratedId={order.sellerId ? order.sellerId : ""}
          />
        )}
    </div>
  );
};
