import { Order, OrderStatus } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { Rating } from "./Rating";

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
    <div className="flex flex-col items-center">
      <p className="text-left w-full text-xs text-primary">
        {t("buyer")}:{" "}
        <span className="text-xs text-primary font-bold">{username}</span>
      </p>
    </div>
  );
};
