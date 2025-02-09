import React from "react";
import { LucideProps, Star } from "lucide-react";
import UserStatBadge from "./UserStatBadge"; // Adjust the import path as necessary

interface UserStatsProps {
  rating: number;
  transactionCount: number;
}

const CustomCircleCheckIcon = React.forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`w-4 h-4 ${props.className || ""}`}
        {...props}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M7 12l4 4 6-6"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    );
  }
);

export const UserStats: React.FC<UserStatsProps> = ({
  rating,
  transactionCount,
}) => {
  return (
    <div className="flex space-x-1 w-full">
      <UserStatBadge value={rating} Icon={Star} color="text-yellow-500" />
      <UserStatBadge
        value={transactionCount}
        Icon={CustomCircleCheckIcon}
        color="text-green-500"
      />
    </div>
  );
};
