import React from "react";

interface OrderStatusProps {
  status: string;
}

const OrderStatusBar: React.FC<OrderStatusProps> = ({ status }) => {
  const getStageClass = (stage: number) => {
    switch (stage) {
      case 1:
        return status === "PENDING"
          ? "bg-primary/80 text-white"
          : status !== "PENDING"
          ? "bg-primary/80 text-white"
          : "bg-white";
      case 2:
        return status === "WAITING_PAYMENT"
          ? "bg-primary/80 text-white"
          : status === "ACTIVE" ||
            status === "FIAT_SENT" ||
            status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-primary/80 text-white"
          : "bg-lightYellow text-secondary";
      case 3:
        return status === "ACTIVE"
          ? "bg-primary/80 text-white"
          : status === "FIAT_SENT" ||
            status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-primary/80 text-white"
          : "bg-lightYellow  text-secondary";
      case 4:
        return status === "FIAT_SENT"
          ? "bg-primary/80 text-white"
          : status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-primary/80 text-white"
          : status === "CANCELLED"
          ? "bg-error"
          : "bg-lightYellow  text-secondary";
      default:
        return "bg-lightYellow  text-secondary";
    }
  };

  return (
    <div className="flex w-full h-6 overflow-hidden rounded-t-lg shadow-sm font-secondary text-sm">
      {[1, 2, 3, 4].map((stage) => (
        <div
          key={stage}
          className={`flex-1 relative ${getStageClass(
            stage
          )} border-r border-secondary/60 last:border-r-0 transition-all duration-300`}
        >
          <span className="absolute inset-0 flex items-center justify-center text-md">
            {stage}
          </span>
        </div>
      ))}
    </div>
  );
};

export default OrderStatusBar;
