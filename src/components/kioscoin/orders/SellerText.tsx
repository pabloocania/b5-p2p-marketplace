import { Order, OrderStatus } from "b5-api-client/dist/types";
import { useTranslation } from "react-i18next";

interface SellerTextProps {
  order: Order;
  userId: string | undefined;
}

export const SellerText: React.FC<SellerTextProps> = ({ order, userId }) => {
  const { t } = useTranslation();

  const username =
    order.sellerId === userId
      ? t("you")
      : order.sellerUsername
      ? "@" + order.sellerUsername
      : order.sellerId;

  return (
    <div className="text-right w-full font-secondary">
      <p
        className="text-left w-full text-xs text-primary"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {t("seller")}:{" "}
        <span
          className="text-xs text-primary font-bold"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {username}
        </span>
      </p>
    </div>
  );
};
