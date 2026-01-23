"use client";
import React from "react";
import { OrderType } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

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
    <div className="w-full space-y-2 font-secondary">
      {/* <h3 className="text-dark text-xs">{t("i_want_to")}</h3> */}
      {/* Botonera horizontal */}
      <div className="flex gap-2">
        {[
          {
            id: "SELL",
            label: t("sell"),
            icon: <ArrowUpFromLine className="w-5 h-5 mb-1" />,
            isSelected: orderType === "SELL",
          },
          {
            id: "BUY",
            label: t("buy"),
            icon: <ArrowDownToLine className="w-5 h-5 mb-1" />,
            isSelected: orderType === "BUY",
          },
        ].map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onChange(action.id as OrderType)}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-4 min-h-[40px] rounded-2xl transition shadow-sm

              ${
                action.isSelected
                  ? "bg-dark text-secondary"
                  : "bg-lightYellow/20 hover:bg-lightYellow/40 text-dark/60"
              }
            `}
          >
            {action.icon}
            <span className="text-sm font-semibold">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrderTypeSelector;
