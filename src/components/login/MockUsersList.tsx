import { Button } from "@/components/ui/button";
import { KioscoinUser } from "b5-api-client";

interface MockUsersListProps {
  readonly mockUsers: KioscoinUser[];
  readonly onLogin: (user: KioscoinUser) => void;
}

export const MockUsersList = ({ mockUsers, onLogin }: MockUsersListProps) => {
  return (
    <div className="space-y-4">
      {mockUsers.map((mockUser) => (
        <Button
          key={mockUser.id}
          onClick={() => onLogin(mockUser)}
          className="w-full text-white text-xs md:text-base bg-terciary"
        >
          {mockUser.username}
        </Button>
      ))}
    </div>
  );
};
