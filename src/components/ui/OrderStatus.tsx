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
          : "bg-gray-300";
      case 2:
        return status === "WAITING_PAYMENT"
          ? "bg-yellow-500"
          : status === "ACTIVE" ||
            status === "FIAT_SENT" ||
            status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-green-500"
          : "bg-gray-300";
      case 3:
        return status === "ACTIVE"
          ? "bg-yellow-500"
          : status === "FIAT_SENT" ||
            status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-green-500"
          : "bg-gray-300";
      case 4:
        return status === "FIAT_SENT"
          ? "bg-yellow-500"
          : status === "COMPLETED" ||
            status === "COMPLETED_BY_ADMIN" ||
            status === "RELEASED"
          ? "bg-green-500"
          : status === "CANCELLED"
          ? "bg-red-500"
          : "bg-gray-300";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="flex w-full h-2 rounded-t-lg overflow-hidden">
      {[1, 2, 3, 4].map((stage) => (
        <div key={stage} className={`flex-1 ${getStageClass(stage)}`}></div>
      ))}
    </div>
  );
};

export default OrderStatusBar;
