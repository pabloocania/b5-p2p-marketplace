import React from "react";
import { LucideIcon } from "lucide-react"; // Adjust the import path as necessary

interface UserStatBadgeProps {
  value: number;
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
  bgColor = "bg-primary bg-opacity-5",
}) => {
  return (
    <div
      className={`flex items-center space-x-1 ${color} text-m rounded-lg px-1 py-1 bg-white bg-opacity-80 border border-primary border-opacity-20`}
    >
      <span className="text-xs font-semibold">{value}</span>
      <Icon className="w-3 h-3" style={{ fill: "currentColor" }} />
    </div>
  );
};

export default UserStatBadge;
