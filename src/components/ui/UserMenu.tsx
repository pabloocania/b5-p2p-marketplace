import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserProps } from "../../lib/useUser";
import InternalTransfersComponent from "@/lib/web3/InternalTransfersComponent";
import { useAccount } from "wagmi";
import KioscoinConnectButton from "@/lib/web3/KioscoinConnectButton";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface UserMenuProps {
  user: UserProps | undefined;
  // openConnectModal: boolean | false;
  onLogin: (user: UserProps) => void;
  onLogout: () => void;
}

const UserMenu = ({ user, onLogin, onLogout }: UserMenuProps) => {
  const [mockUsers, setMockUsers] = useState<UserProps[]>([]);
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectModalOpen } = useConnectModal();

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

  useEffect(() => {
    if (isConnected) {
      setIsConnecting(false);
    }
    if (!connectModalOpen) {
      setIsConnecting(false);
    }
  }, [isConnected, connectModalOpen]);

  function ConnectWalletButton() {
    return (
      <div className="w-full">
        <style jsx>{`
          div :global(.iek7po2) {
            width: 100%;
          }
        `}</style>
        <KioscoinConnectButton
          onConnectingChange={setIsConnecting}
          isConnecting={isConnecting}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      {user ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center">
                <p className="font-bold text-primary">
                  {t("user")}: {user.username}
                </p>
              </div>
              <p className="text-xs ">ID: {user.userId}</p>
              {/* <p className="text-sm text-gray-500">{user.email}</p> */}
            </div>
          </div>
          <div className="w-full">{ConnectWalletButton()}</div>
          {/* <div className="w-full"> */}
          {isConnecting && (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                <span className="text-sm block">{t("loading_wallet")}</span>
              </div>
            </div>
          )}
          {isConnected && (
            <div className="w-full">
              <InternalTransfersComponent />
            </div>
          )}
          <Button
            onClick={onLogout}
            variant="default"
            className="w-full text-white"
          >
            Log Out
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {mockUsers.map((mockUser) => (
            <Button
              key={mockUser.userId}
              onClick={() => onLogin(mockUser)}
              className="w-full text-white text-xs md:text-base"
            >
              {mockUser.username}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
