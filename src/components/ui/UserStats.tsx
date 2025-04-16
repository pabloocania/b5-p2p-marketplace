import React from "react";
import { LucideProps, Star, Clock, Timer, CheckCircle2 } from "lucide-react";
import UserStatBadge from "./UserStatBadge"; // Adjust the import path as necessary

interface UserStatsProps {
  rating?: string;
  transactionCount?: number;
  userMetrics?: {
    userId: string;
    avgTimeToLock: number;
    avgTimeToRelease: number;
    avgTimeToFiatSent: number;
  };
  isSeller?: boolean;
}

export const UserStats: React.FC<UserStatsProps> = ({
  rating,
  transactionCount,
  userMetrics,
}) => {
  // Calculate time metrics based on user role
  const getTimeMetrics = () => {
    // Calculate average only using available non-zero values
    const availableValues = [];
    if (
      userMetrics?.avgTimeToLock !== undefined &&
      userMetrics.avgTimeToLock > 0
    ) {
      availableValues.push(userMetrics.avgTimeToLock);
    }

    if (
      userMetrics?.avgTimeToRelease !== undefined &&
      userMetrics.avgTimeToRelease > 0
    ) {
      availableValues.push(userMetrics.avgTimeToRelease);
    }

    if (
      userMetrics?.avgTimeToFiatSent !== undefined &&
      userMetrics.avgTimeToFiatSent > 0
    ) {
      availableValues.push(userMetrics.avgTimeToFiatSent);
    }

    if (availableValues.length === 0) {
      return null;
    }

    const totalTime = availableValues.reduce((sum, value) => sum + value, 0);
    const averageTime = totalTime / availableValues.length;
    return formatTime(averageTime);
  };

  // Format time in seconds to minutes with two decimal places (e.g., "1.58m")
  const formatTime = (seconds: number): string => {
    if (seconds < 0) return "0.00m"; // Handle potential negative values gracefully

    const totalMinutes = seconds / 60;
    return `${totalMinutes.toFixed(2)}m`;
  };

  const timeMetrics = getTimeMetrics();

  return (
    <div className="flex space-x-1">
      {transactionCount !== undefined && transactionCount !== null && (
        <UserStatBadge
          value={transactionCount.toString()}
          Icon={CheckCircle2}
          color="text-green-500"
        />
      )}
      {rating && (
        <UserStatBadge value={rating} Icon={Star} color="text-yellow-500" />
      )}
      {timeMetrics && (
        <UserStatBadge
          value={timeMetrics}
          Icon={Timer}
          color="text-primary/80"
        />
      )}
    </div>
  );
};
