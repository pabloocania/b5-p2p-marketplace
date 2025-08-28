import React from "react";

interface OrderStatusProps {
  status: string;
}

const OrderStatusBar: React.FC<OrderStatusProps> = ({ status }) => {
  const getStageClass = (stage: number) => {
    switch (stage) {
      case 1:
        return status === "PENDING"
          ? "bg-primary"
          : status !== "PENDING"
          ? "bg-primary"
          : "bg-gray-300";
      case 2:
        return status === "WAITING_PAYMENT"
          ? "bg-primary"
          : status === "ACTIVE" ||
            status === "FIAT_SENT" ||
            status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-primary"
          : "bg-gray-300";
      case 3:
        return status === "ACTIVE"
          ? "bg-primary"
          : status === "FIAT_SENT" ||
            status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-primary"
          : "bg-gray-300";
      case 4:
        return status === "FIAT_SENT"
          ? "bg-primary"
          : status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-primary"
          : status === "CANCELLED"
          ? "bg-error"
          : "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="flex w-full h-6 overflow-hidden rounded-t-lg shadow-sm">
      {[1, 2, 3, 4].map((stage) => (
        <div
          key={stage}
          className={`flex-1 relative ${getStageClass(
            stage
          )} border-r border-white/20 last:border-r-0 transition-all duration-300`}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
            {stage}
          </span>
        </div>
      ))}
    </div>
  );
};

export default OrderStatusBar;
