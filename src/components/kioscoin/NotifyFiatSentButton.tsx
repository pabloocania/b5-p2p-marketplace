import React from "react";
import { Button } from "@/components/ui/button";
import { Order } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { formatFiatAmount } from "@/lib/utils";
import { EntityBadge } from "./PaymentMethodDisplay";

interface NotifyFiatSentButtonProps {
  order: Order;
  orderTaken: boolean;
  onRefresh?: () => void;
  fiatSent: (order: Order) => Promise<void>;
}

const formatAlias = (alias: string | undefined): string => {
  return alias?.startsWith("@") ? alias : `${alias}`;
};

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
    onRefresh?.();
  };

  return (
    <div className="space-y-1 bg-white bg-yellow-100/50 rounded-lg">
      <div className="px-2 py-2 rounded-lg">
        <div className="text-left mb-3 space-y-2">
          <p className="text-md font-semibold text-primary">
            <span className="mr-1 font-bold text-terciary">
              @{order.sellerUsername}
            </span>
            {t("seller_has_locked")}
          </p>
          <p className="text-md font-semibold text-primary">
            {t("send")}
            <span className="ml-1 mr-1 text-xl font-bold text-black">
              {formatFiatAmount(order.fiatAmount, order.fiatCode)}
            </span>
            {t("to_receive")}
          </p>
          <div className="space-y-2 my-1">
            {order.paymentMethods?.map((method, index) => (
              <div key={index} className="flex items-center">
                <EntityBadge
                  entity={method.entity!}
                  type={method.type!}
                  alias={formatAlias(method.alias)}
                  size="lg"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="text-primary text-center text-xs text-left bg-secondary/10 py-2 px-2 mb-2 rounded-md">
          <p>{t("please_verify_payment_details")}</p>
        </div>
        <Button
          className="w-full text-white bg-yellow-500"
          onClick={handleClick}
        >
          {t("notify_fiat_sent")}
        </Button>
      </div>
    </div>
  );
};

export default NotifyFiatSentButton;
