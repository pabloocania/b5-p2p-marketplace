import React from "react";
import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client";
import { useTranslation } from "react-i18next";

interface NotifyFiatSentButtonProps {
  order: Order;
  orderTaken: boolean;
  onRefresh: () => void;
  fiatSent: (order: Order) => Promise<void>;
}

const NotifyFiatSentButton: React.FC<NotifyFiatSentButtonProps> = ({
  order,
  orderTaken,
  onRefresh,
  fiatSent,
}) => {
  const { t } = useTranslation();

  const handleClick = () => {
    if (!orderTaken) {
      fiatSent(order);
    }
    onRefresh(); // Call the refresh callback
  };

  return (
    <Button className="w-full text-white bg-yellow-500" onClick={handleClick}>
      {t("notify_fiat_sent")}
    </Button>
  );
};

export default NotifyFiatSentButton;
