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
      className={`flex items-center space-x-2 ${color} text-m rounded-lg px-3 py-2 border border-gray-200 ${bgColor}`}
    >
      <span className="text-sm font-medium">{value}</span>
      <Icon className="w-4 h-4" />
    </div>
  );
};

export default UserStatBadge;
