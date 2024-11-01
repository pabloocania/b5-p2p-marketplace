import React from "react";

interface OrderStatusProps {
  status: string;
}

const OrderStatusBar: React.FC<OrderStatusProps> = ({ status }) => {
  const getStageClass = (stage: number) => {
    switch (stage) {
      case 1:
        return status === "PENDING"
          ? "bg-yellow-500"
          : status !== "PENDING"
          ? "bg-green-500"
          : "bg-gray-400";
      case 2:
        return status === "WAITING_PAYMENT"
          ? "bg-yellow-500"
          : status === "ACTIVE" ||
            status === "FIAT_SENT" ||
            status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-green-500"
          : "bg-gray-400";
      case 3:
        return status === "ACTIVE"
          ? "bg-yellow-500"
          : status === "FIAT_SENT" ||
            status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-green-500"
          : "bg-gray-400";
      case 4:
        return status === "FIAT_SENT"
          ? "bg-yellow-500"
          : status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-green-500"
          : status === "CANCELLED"
          ? "bg-red-500"
          : "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="flex w-full border-b border-black h-4 rounded-t-lg overflow-hidden">
      {[1, 2, 3, 4].map((stage) => (
        <div
          key={stage}
          className={`flex-1 relative ${getStageClass(
            stage
          )} border-r border-black-300 last:border-r-0`}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold">
            {stage}
          </span>
        </div>
      ))}
    </div>
  );
};

export default OrderStatusBar;
