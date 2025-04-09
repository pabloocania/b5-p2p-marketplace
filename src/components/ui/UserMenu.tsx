import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserProps } from "../../lib/useUser";
import InternalTransfersComponent from "@/lib/web3/InternalTransfersComponent";
import { useAccount } from "wagmi";
import KioscoinConnectButton from "@/lib/web3/KioscoinConnectButton";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import PushNotificationsToggle from "./PushNotificationsToggle";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserInfoCard } from "./UserInfoCard";

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
        const host =
          process.env.NEXT_PUBLIC_KIOSCOIN_API_URL ??
          "https://bolsillo-argento-586dfd80364d.herokuapp.com";
        const response = await fetch(host + "/api/users");
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

  return user ? (
    <Card className="w-full mb-4" variant="shadow">
      <CardHeader>
        <CardTitle>
          <UserInfoCard user={user} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full">
          <PushNotificationsToggle
            userId={user.userId}
          ></PushNotificationsToggle>
        </div>
        <div className="w-full">{ConnectWalletButton()}</div>
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
      </CardContent>
      <Separator className="mb-1" />
      <CardFooter>
        <Button
          onClick={onLogout}
          variant="default"
          className="w-full text-white"
        >
          Log Out
        </Button>
      </CardFooter>
    </Card>
  ) : (
    <Card className="w-full mb-4" variant="shadow">
      <CardHeader>
        <CardTitle>{t("select_user")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockUsers.map((mockUser) => (
          <Button
            key={mockUser.userId}
            onClick={() => onLogin(mockUser)}
            className="w-full text-white text-xs md:text-base"
          >
            {mockUser.username}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default UserMenu;
