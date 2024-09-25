import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserProps } from "../../lib/useUser";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface UserMenuProps {
  user: UserProps | undefined;
  onLogin: (user: UserProps) => void;
  onLogout: () => void;
}

const UserMenu = ({ user, onLogin, onLogout }: UserMenuProps) => {
  const [mockUsers, setMockUsers] = useState<UserProps[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(
          "https://bolsillo-argento-586dfd80364d.herokuapp.com/api/users"
        );
        const data = await response.json();
        const users = data.users.map((user: any) => ({
          userId: user.id,
          username: user.username,
          email: `${user.username}@example.com`, // Assuming email is not provided in the response
          avatarUrl: "https://via.placeholder.com/150", // Assuming avatarUrl is not provided in the response
        }));
        setMockUsers(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <ConnectButton
        showBalance={false}
        chainStatus={{ smallScreen: "none", largeScreen: "icon" }}
      />
      {user ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback>
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.username}</p>
              <p className="text-sm">User ID: {user.userId}</p>
              {/* <p className="text-sm text-gray-500">{user.email}</p> */}
            </div>
          </div>

          <Button onClick={onLogout} variant="outline" className="w-full">
            Log Out
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {mockUsers.map((mockUser) => (
            <Button
              key={mockUser.userId}
              onClick={() => onLogin(mockUser)}
              className="w-full"
            >
              Log In as {mockUser.username}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
