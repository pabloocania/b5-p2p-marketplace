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
  isSeller,
}) => {
  // Calculate time metrics based on user role
  const getTimeMetrics = () => {
    if (isSeller === undefined) {
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
    }

    if (isSeller) {
      // For sellers: avgTimeToLock + avgTimeToRelease
      if (
        userMetrics?.avgTimeToLock === undefined ||
        userMetrics?.avgTimeToRelease === undefined
      ) {
        return null;
      }

      // Only include non-zero values in the calculation
      const values = [];
      if (userMetrics.avgTimeToLock > 0) {
        values.push(userMetrics.avgTimeToLock);
      }
      if (userMetrics.avgTimeToRelease > 0) {
        values.push(userMetrics.avgTimeToRelease);
      }

      if (values.length === 0) {
        return null;
      }

      const totalTime = values.reduce((sum, value) => sum + value, 0);
      return formatTime(totalTime);
    } else {
      // For buyers: avgTimeToFiatSent
      if (
        userMetrics?.avgTimeToFiatSent === undefined ||
        userMetrics.avgTimeToFiatSent === 0
      ) {
        return null;
      }
      return formatTime(userMetrics.avgTimeToFiatSent);
    }
  };

  // Format time in seconds to a readable format (e.g., "2m 30s")
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const timeMetrics = getTimeMetrics();

  return (
    <div className="flex space-x-1 w-full">
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
      {transactionCount !== undefined && transactionCount !== null && (
        <UserStatBadge
          value={transactionCount.toString()}
          Icon={CheckCircle2}
          color="text-green-500"
        />
      )}
    </div>
  );
};
