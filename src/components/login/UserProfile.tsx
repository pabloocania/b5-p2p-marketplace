import { Button } from "@/components/ui/button";
import { LogOut, Loader2, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import { KioscoinUser } from "b5-api-client";

interface UserProfileProps {
  readonly user: KioscoinUser;
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

  // Define the reset onboarding handler here
  const handleResetOnboardingState = () => {
    localStorage.removeItem("hasSeenSmartWalletOnboarding");
    alert(
      t(
        "onboarding_reset_description",
        "Onboarding will show next time you connect your wallet"
      )
    );
  };

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
        <CardTitle className="flex justify-center items-center align-center mt-2 w-full">
          <UserInfoCard user={user} order={undefined} />
        </CardTitle>
      </CardHeader>
      <Separator className="mt-2 mb-4" />
      <CardContent className="space-y-4">
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
        <div className="w-full">
          <PushNotificationsToggle userId={user.id!}></PushNotificationsToggle>
        </div>
        <div className="w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetOnboardingState}
            className="flex items-center border border-primary/50 text-primary"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            <span className="text-xs">{t("reset_onboarding")}</span>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="py-2">
        <Button
          onClick={onLogout}
          variant="default"
          className="w-full text-white bg-primary"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </CardFooter>
    </Card>
  );
};
