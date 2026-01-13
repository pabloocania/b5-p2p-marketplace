import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Order, PaymentMethod } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { formatFiatAmount, formatFiatAmountForCopy } from "@/lib/utils";
import { Landmark, WalletMinimal, Copy, Check } from "lucide-react";
import { FiatSentGuardSheet } from "./orders/FiatSentGuardSheet";

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
    <div className="rounded-md p-1 bg-secondary/20">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold">
          <IconComponent className="w-4 h-4 text-primary" />
        </div>
        <span className="text-primary text-xs font-bold">
          {method.entity ?? method.type}
        </span>
      </div>
      {method.alias && (
        <button
          onClick={handleCopy}
          className="w-full mt-1 flex items-center justify-between gap-2 bg-white rounded-lg px-2 py-1 hover:bg-primary/10 transition-colors"
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
  const [guardOpen, setGuardOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [amountCopied, setAmountCopied] = useState(false);

  const handleClick = () => {
    setGuardOpen(true);
  };

  const handleCopyAmount = async () => {
    const copyValue = formatFiatAmountForCopy(order.fiatAmount);
    await navigator.clipboard.writeText(copyValue);
    setAmountCopied(true);
    setTimeout(() => setAmountCopied(false), 2000);
  };

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      if (!orderTaken) {
        await fiatSent(order);
      }
      onRefresh?.();
      setGuardOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-secondary/10 rounded-xl p-3 font-secondary">
      <p className="text-xs text-dark mb-3">{t("seller_has_locked")}</p>

      <p className="text-base font-semibold text-dark mb-4">
        {t("send")}{" "}
        <button
          onClick={handleCopyAmount}
          className="inline-flex items-center gap-1 text-xl font-bold text-primary hover:opacity-80 transition-opacity"
        >
          {formatFiatAmount(order.fiatAmount, order.fiatCode)}
          {amountCopied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>{" "}
        {t("to_receive")}
      </p>

      <div className="space-y-2 mb-2">
        {order.paymentMethods?.map((method, index) => (
          <PaymentDestination
            key={`${method.type}-${method.entity}-${index}`}
            method={method}
          />
        ))}
        <p className="text-xs text-dark text-center py-2 px-3 rounded-lg mb-3">
          {t("please_verify_payment_details")}
        </p>
      </div>

      <Button
        className="w-full text-white bg-secondary hover:bg-primary"
        onClick={handleClick}
      >
        {t("notify_fiat_sent")}
      </Button>

      <FiatSentGuardSheet
        open={guardOpen}
        onOpenChange={setGuardOpen}
        onConfirm={handleConfirm}
        loading={submitting}
      />
    </div>
  );
};

export default NotifyFiatSentButton;
