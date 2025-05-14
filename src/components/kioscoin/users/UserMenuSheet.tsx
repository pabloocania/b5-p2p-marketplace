import { ReactNode } from "react";
import { CreateOrderContainer } from "../orders/CreateOrderContainer";
import UserMenuNew from "./UserMenuNew";
import { KioscoinUser } from "b5-api-client";

interface UserMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: KioscoinUser | undefined;
  onLogin: (userData: KioscoinUser, loginId: string) => void;
  onLogout: () => void;
  trigger?: ReactNode;
}

export function UserMenuSheet({
  open,
  onOpenChange,
  user,
  onLogin,
  onLogout,
  trigger,
}: UserMenuSheetProps) {
  return (
    <CreateOrderContainer
      open={open}
      onOpenChange={onOpenChange}
      variant="sheet"
      trigger={trigger}
    >
      <UserMenuNew user={user} onLogin={onLogin} onLogout={onLogout} />
    </CreateOrderContainer>
  );
}
