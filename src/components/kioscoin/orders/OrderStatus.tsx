import React from "react";

interface OrderStatusProps {
  status: string;
}

// Map status to stage number (1-indexed)
const STATUS_TO_STAGE: Readonly<Record<string, number>> = {
  PENDING: 1,
  WAITING_PAYMENT: 2,
  ACTIVE: 3,
  FIAT_SENT: 4,
  COMPLETED: 5,
  COMPLETED_BY_ADMIN: 5,
  RELEASED: 5,
};

const STYLES = {
  completed: "bg-primary/80 text-white",
  current: "bg-lightYellow text-dark",
  pending: "bg-secondary/20 text-gray-500",
  cancelled: "bg-secondary/20 text-gray-500 ",
} as const;

interface StageProps {
  readonly stage: number;
  readonly isCompleted: boolean;
  readonly isCurrent: boolean;
  readonly isCancelled: boolean;
}

const Stage: React.FC<StageProps> = ({
  stage,
  isCompleted,
  isCurrent,
  isCancelled,
}) => {
  const getBaseClass = (): string => {
    if (isCancelled && stage === 4) return STYLES.cancelled;
    if (isCompleted) return STYLES.completed;
    return STYLES.pending;
  };

  return (
    <div
      className={`flex-1 relative ${getBaseClass()} border-r-2 border-secondary last:border-r-0 overflow-hidden`}
    >
      {/* Progress sweep animation for current stage */}
      {isCurrent && !isCancelled && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/80 to-transparent animate-progress-sweep"
          style={{
            backgroundSize: "200% 100%",
          }}
        />
      )}
      <span className="absolute inset-0 flex items-center justify-center text-md z-10">
        {stage}
      </span>
    </div>
  );
};

const OrderStatusBar: React.FC<OrderStatusProps> = ({ status }) => {
  const currentStage = STATUS_TO_STAGE[status] ?? 0;
  const isCancelled = status === "CANCELED";

  return (
    <div className="flex w-full h-4 overflow-hidden rounded-t-lg shadow-sm font-secondary text-xs text-dark">
      {[1, 2, 3, 4].map((stage) => (
        <Stage
          key={stage}
          stage={stage}
          isCompleted={stage < currentStage}
          isCurrent={stage === currentStage}
          isCancelled={isCancelled}
        />
      ))}
    </div>
  );
};

export default OrderStatusBar;
