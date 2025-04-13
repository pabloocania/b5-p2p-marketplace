import { Button } from "@/components/ui/button";
import { UserProps } from "../../lib/useUser";

interface MockUsersListProps {
  readonly mockUsers: UserProps[];
  readonly onLogin: (user: UserProps) => void;
}

export const MockUsersList = ({ mockUsers, onLogin }: MockUsersListProps) => {
  return (
    <div className="space-y-4">
      {mockUsers.map((mockUser) => (
        <Button
          key={mockUser.userId}
          onClick={() => onLogin(mockUser)}
          className="w-full text-white text-xs md:text-base bg-terciary"
        >
          {mockUser.username}
        </Button>
      ))}
    </div>
  );
};
