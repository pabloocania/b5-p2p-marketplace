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
          : "bg-white";
      case 2:
        return status === "WAITING_PAYMENT"
          ? "bg-primary"
          : status === "ACTIVE" ||
            status === "FIAT_SENT" ||
            status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-primary"
          : "bg-lightYellow text-muted";
      case 3:
        return status === "ACTIVE"
          ? "bg-primary"
          : status === "FIAT_SENT" ||
            status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-primary"
          : "bg-lightYellow  text-muted";
      case 4:
        return status === "FIAT_SENT"
          ? "bg-primary"
          : status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-primary"
          : status === "CANCELLED"
          ? "bg-error"
          : "bg-lightYellow  text-muted";
      default:
        return "bg-lightYellow  text-muted";
    }
  };

  return (
    <div className="flex w-full h-6 overflow-hidden rounded-t-lg shadow-sm font-secondary text-md">
      {[1, 2, 3, 4].map((stage) => (
        <div
          key={stage}
          className={`flex-1 relative ${getStageClass(
            stage
          )} border-r border-secondary/20 last:border-r-0 transition-all duration-300`}
        >
          <span className="absolute inset-0 flex items-center justify-center font-bold text-md text-secondary">
            {stage}
          </span>
        </div>
      ))}
    </div>
  );
};

export default OrderStatusBar;
