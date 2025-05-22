"use client";
import React from "react";
import { OrderType } from "b5-api-client";
import { useTranslation } from "react-i18next";

interface OrderTypeSelectorProps {
  orderType: OrderType;
  onChange: (type: OrderType) => void;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({
  orderType,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-1">
      <label className="font-bold text-base mb-1">{t("i_want_to")}</label>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => onChange("BUY")}
          className={`px-4 py-2 rounded font-bold border transition ${
            orderType === "BUY"
              ? "bg-green-500 text-white border-green-600"
              : "bg-white text-green-600 border-green-500"
          }`}
        >
          {t("buy")}
        </button>
        <button
          type="button"
          onClick={() => onChange("SELL")}
          className={`px-4 py-2 rounded font-bold border transition ${
            orderType === "SELL"
              ? "bg-red-500 text-white border-red-600"
              : "bg-white text-red-600 border-red-500"
          }`}
        >
          {t("sell")}
        </button>
      </div>
    </div>
  );
};

export default OrderTypeSelector;
