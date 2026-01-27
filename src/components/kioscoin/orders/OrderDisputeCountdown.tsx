import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Order, OrderStatus } from "b5-api-client";
import { ConfigStore, OrderToleranceConfig } from "@/lib/ConfigStore";
import { differenceInMinutes, parseISO } from "date-fns";
import { useKioscoinUserContext } from "../users/KioscoinUserContext";

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

interface OrderDisputeCountdownProps {
  readonly order: Order;
  readonly onReadyChange?: (isReady: boolean | null) => void;
}

const OrderDisputeCountdown: React.FC<OrderDisputeCountdownProps> = ({
  order,
  onReadyChange,
}) => {
  const { user } = useKioscoinUserContext();
  const isSeller = user?.id === order.sellerId;

  if (order.status === "ACTIVE" && !isSeller) {
    onReadyChange?.(null);
    return null;
  }

  if (order.buyerDisputed || order.sellerDisputed) {
    onReadyChange?.(null);
    return null;
  }

  const { t } = useTranslation();
  const [toleranceConfig, setToleranceConfig] =
    useState<OrderToleranceConfig | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [startAt, setStartAt] = useState<string | null>(
    order.updatedAt ?? null
  );
  const lastStatusRef = useRef(order.status);

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

  useEffect(() => {
    setStartAt(order.updatedAt ?? null);
    lastStatusRef.current = order.status;
  }, [order.id, order.updatedAt]);

  useEffect(() => {
    if (!order.status) return;
    if (order.status !== lastStatusRef.current) {
      setStartAt(new Date().toISOString());
      lastStatusRef.current = order.status;
    }
  }, [order.status]);

  const toleranceMinutes = useMemo(() => {
    if (!toleranceConfig) return null;
    return getToleranceByStatus(order.status, toleranceConfig);
  }, [order.status, toleranceConfig]);

  const remainingMinutes = useMemo(() => {
    if (!toleranceMinutes) return null;

    const rawStartAt = startAt ?? order.updatedAt ?? null;
    if (!rawStartAt) return null;

    const startDate = parseISO(rawStartAt);
    if (Number.isNaN(startDate.getTime())) return null;

    const elapsedMinutes = Math.max(0, differenceInMinutes(now, startDate));
    return Math.max(0, Math.ceil(toleranceMinutes - elapsedMinutes));
  }, [toleranceMinutes, startAt, order.updatedAt, now]);

  const isReady = remainingMinutes === null ? null : remainingMinutes <= 0;

  useEffect(() => {
    onReadyChange?.(isReady);
  }, [onReadyChange, remainingMinutes, isReady]);

  if (remainingMinutes === null || !toleranceMinutes) {
    return null;
  }

  const progress = Math.min(
    1,
    (toleranceMinutes - remainingMinutes) / Math.max(1, toleranceMinutes)
  );

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
