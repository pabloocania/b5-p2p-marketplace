import React from "react";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

export interface IconButtonProps extends ButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label?: string;
  iconClassName?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  label,
  iconClassName = "h-3 w-3",
  children,
  ...buttonProps
}) => {
  return (
    <Button {...buttonProps}>
      <Icon className={iconClassName} />
      {label ?? children ? (
        <span className={label ? "ml-1" : ""}>{label ?? children}</span>
      ) : null}
    </Button>
  );
};
