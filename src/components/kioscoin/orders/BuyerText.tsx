import { Order, OrderStatus } from "b5-api-client";
import { useTranslation } from "react-i18next";

interface BuyerTextProps {
  order: Order;
  userId: string | undefined;
}

export const BuyerText: React.FC<BuyerTextProps> = ({ order, userId }) => {
  const { t } = useTranslation();

  const username =
    order.buyerId === userId
      ? t("you")
      : order.buyerUsername
      ? "@" + order.buyerUsername
      : order.buyerId;

  return (
    <div className="flex flex-col items-center font-secondary">
      <p
        className="text-left w-full text-xs text-primary"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        {t("buyer")}:{" "}
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
