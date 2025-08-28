import React from "react";
import { LucideIcon } from "lucide-react"; // Adjust the import path as necessary

interface UserStatBadgeProps {
  value: string;
  Icon: LucideIcon;
  color?: string;
  bgColor?: string;
  width?: string;
  height?: string;
}

const UserStatBadge: React.FC<UserStatBadgeProps> = ({
  value,
  Icon,
  color = "text-yellow-500",
  bgColor = "bg-white",
}) => {
  return (
    <div
      className={`flex items-center space-x-1 ${color} text-m rounded-lg px-1 py-1 border border-gray-200 ${bgColor}`}
    >
      <span className="text-xs font-semibold">{value}</span>
      <Icon className="w-3 h-3" />
    </div>
  );
};

export default UserStatBadge;
