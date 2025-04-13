import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserProps } from "../../lib/useUser";
import { UserInfoCard } from "../ui/UserInfoCard";
import PushNotificationsToggle from "../ui/PushNotificationsToggle";
import InternalTransfersComponent from "../../lib/web3/InternalTransfersComponent";
import KioscoinConnectButton from "../../lib/web3/KioscoinConnectButton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface UserProfileProps {
  readonly user: UserProps;
  readonly onLogout: () => void;
  readonly isConnected: boolean;
  readonly isConnecting: boolean;
  readonly onConnectingChange: (isConnecting: boolean) => void;
}

export const UserProfile = ({
  user,
  onLogout,
  isConnected,
  isConnecting,
  onConnectingChange,
}: UserProfileProps) => {
  const { t } = useTranslation();

  function ConnectWalletButton() {
    return (
      <div className="w-full">
        <style jsx>{`
          div :global(.iek7po2) {
            width: 100%;
          }
        `}</style>
        <KioscoinConnectButton
          onConnectingChange={onConnectingChange}
          isConnecting={isConnecting}
        />
      </div>
    );
  }

  return (
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
          className="w-full text-white bg-terciary"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </CardFooter>
    </Card>
  );
};
