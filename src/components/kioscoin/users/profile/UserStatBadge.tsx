import React from "react";

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
      className={`inline-flex items-center space-x-1 bg-white rounded-md px-2 py-1 border border-primary/20 text-xs ${
        color ?? "text-primary"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="font-bold leading-none">{value}</span>
    </span>
  );
};

export default UserStatBadge;
