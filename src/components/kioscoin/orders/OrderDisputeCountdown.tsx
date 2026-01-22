import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Order, OrderStatus } from "b5-api-client";
import { ConfigStore, OrderToleranceConfig } from "@/lib/ConfigStore";
import { differenceInMinutes, parseISO } from "date-fns";

const getToleranceByStatus = (
  status: OrderStatus | undefined,
  tolerance: OrderToleranceConfig
): number | null => {
  if (!status) return null;

  switch (status) {
    case "WAITING_PAYMENT":
      return tolerance.waitingPaymentMinutes;
    case "ACTIVE":
      return tolerance.activeMinutes;
    case "FIAT_SENT":
      return tolerance.fiatSentMinutes;
    default:
      return null;
  }
};

const OrderDisputeCountdown: React.FC<{ order: Order }> = ({ order }) => {
  const { t } = useTranslation();
  const [toleranceConfig, setToleranceConfig] =
    useState<OrderToleranceConfig | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let isActive = true;
    ConfigStore.getInstance()
      .getOrderTolerance()
      .then((config) => {
        if (!isActive) return;
        setToleranceConfig(config);
      })
      .catch(() => {
        // Keep default tolerance on error
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const toleranceMinutes = useMemo(() => {
    if (!toleranceConfig) return null;
    return getToleranceByStatus(order.status, toleranceConfig);
  }, [order.status, toleranceConfig]);

  if (!toleranceMinutes || !order.createdAt) {
    return null;
  }

  const createdAt = parseISO(order.createdAt);
  if (Number.isNaN(createdAt.getTime())) {
    return null;
  }

  const elapsedMinutes = Math.max(0, differenceInMinutes(now, createdAt));
  const remainingMinutes = Math.max(
    0,
    Math.ceil(toleranceMinutes - elapsedMinutes)
  );
  const progress = Math.min(1, elapsedMinutes / Math.max(1, toleranceMinutes));
  const isReady = remainingMinutes <= 0;

  return (
    <div className="mt-2 rounded-md px-4 py-2 w-full font-secondary">
      <div className="text-center items-center gap-2 text-xs text-primary">
        {/* <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" /> */}
        <span>
          {isReady
            ? t("cancel_or_dispute_ready")
            : t("cancel_or_dispute_wait", { minutes: remainingMinutes })}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white border border-secondary/60">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};

export default OrderDisputeCountdown;
