import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Order, PaymentMethod } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { formatFiatAmount } from "@/lib/utils";
import { Landmark, WalletMinimal, Copy, Check } from "lucide-react";

interface NotifyFiatSentButtonProps {
  order: Order;
  orderTaken: boolean;
  onRefresh?: () => void;
  fiatSent: (order: Order) => Promise<void>;
}

// Color mappings for payment methods
const entityColorMap: Readonly<Record<string, string>> = {
  "Mercado Pago": "text-blue-500 bg-blue-500/10",
  PayPal: "text-indigo-500 bg-indigo-500/10",
  Stripe: "text-purple-500 bg-purple-500/10",
  Ualá: "text-red-500 bg-red-500/10",
  default: "text-green-500 bg-green-500/10",
};

const paymentMethodColorMap: Readonly<Record<string, string>> = {
  FINTECH: "text-green-500 bg-green-500/10",
  BANK: "text-orange-500 bg-orange-500/10",
} as const;

interface PaymentDestinationProps {
  readonly method: PaymentMethod;
}

const PaymentDestination: React.FC<PaymentDestinationProps> = ({ method }) => {
  const [copied, setCopied] = useState(false);

  const getColors = () => {
    if (method.type === "BANK") return paymentMethodColorMap.BANK;
    return entityColorMap[method.entity ?? ""] ?? paymentMethodColorMap.FINTECH;
  };

  const colors = getColors();
  const [textColor, bgColor] = colors.split(" ");
  const IconComponent = method.type === "BANK" ? Landmark : WalletMinimal;

  const handleCopy = async () => {
    if (method.alias) {
      await navigator.clipboard.writeText(method.alias);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-md p-2 bg-secondary/10 border border-primary/10">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-primary" />
        </div>
        <span className="text-base font-semibold text-primary">
          {method.entity ?? method.type}
        </span>
      </div>
      {method.alias && (
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2.5 hover:bg-secondary/80 transition-colors"
        >
          <span className="text-sm font-mono font-medium text-dark truncate">
            {method.alias}
          </span>
          {copied ? (
            <Check className="w-4 h-4 text-green-500 shrink-0" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </button>
      )}
    </div>
  );
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
    <div className="bg-secondary/10 rounded-xl p-3 font-secondary">
      <p className="text-sm text-dark mb-3">{t("seller_has_locked")}</p>

      <p className="text-base font-semibold text-dark mb-4">
        {t("send")}{" "}
        <span className="text-xl font-bold text-primary">
          {formatFiatAmount(order.fiatAmount, order.fiatCode)}
        </span>{" "}
        {t("to_receive")}
      </p>

      <div className="space-y-2 mb-4">
        {order.paymentMethods?.map((method, index) => (
          <PaymentDestination
            key={`${method.type}-${method.entity}-${index}`}
            method={method}
          />
        ))}
      </div>

      <p className="text-xs text-primary text-center bg-secondary/20 py-2 px-3 rounded-lg mb-3">
        {t("please_verify_payment_details")}
      </p>

      <Button
        className="w-full text-white bg-secondary hover:bg-primary"
        onClick={handleClick}
      >
        {t("notify_fiat_sent")}
      </Button>
    </div>
  );
};

export default NotifyFiatSentButton;
