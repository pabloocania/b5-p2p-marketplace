import React from "react";
import { LucideIcon } from "lucide-react"; // Adjust the import path as necessary

interface UserStatBadgeProps {
  value: string;
  Icon: React.ComponentType<any>;
  color?: string;
  height?: string;
}

const UserStatBadge: React.FC<UserStatBadgeProps> = ({
  value,
  Icon,
  color,
}) => {
  return (
    <span
      className={`inline-flex items-center space-x-1.5 bg-white rounded-md px-1.5 py-0.5 border border-primary/20 text-[11px] ${
        color ?? "text-primary"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="font-medium leading-none">{value}</span>
    </span>
  );
};

export default UserStatBadge;
