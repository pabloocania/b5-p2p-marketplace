import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, UserPlus } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile, EmailLoginForm, RegisterForm } from "./login";
import { KioscoinUser, UserData } from "b5-api-client";
import { useWeb3Auth } from "@web3auth/modal/react";
import KioscoinBrand from "../branding/KioscoinBrand";

interface UserMenuNewProps {
  readonly user: KioscoinUser | undefined;
  readonly onLogin: (user: KioscoinUser, userData: UserData) => void;
  readonly onLogout: () => void;
}

const UserMenuNew = ({ user, onLogin, onLogout }: UserMenuNewProps) => {
  const { isConnected } = useWeb3Auth();
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState("email");

  useEffect(() => {
    if (isConnected) {
      setIsConnecting(false);
    }
  }, [isConnected]);

  if (user) {
    return (
      <UserProfile
        user={user}
        onLogout={onLogout}
        isConnected={isConnected}
        isConnecting={isConnecting}
        onConnectingChange={setIsConnecting}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] border border-secondary/10">
      <Card
        className="w-full max-w-md border border-secondary/50"
        variant="border"
      >
        <CardHeader>
          <KioscoinBrand size="sm" className="items-center" />
        </CardHeader>
        <CardContent className="py-2">
          <Tabs
            defaultValue="mock"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-2 mb-3 bg-secondary/10">
              <TabsTrigger value="email" className="text-primary">
                <Mail className="mr-2 h-4 w-4 text-primary" />
                {t("login")}
              </TabsTrigger>
              {/* <TabsTrigger value="email-link">
              <Key className="mr-2 h-4 w-4" />
              Email Link
            </TabsTrigger> */}
              <TabsTrigger value="register" className="text-primary">
                <UserPlus className="mr-2 h-4 w-4 text-primary" />
                {t("register")}
              </TabsTrigger>
              {/* <TabsTrigger value="mock" className="text-primary">
              <User className="mr-2 h-4 w-4 text-primary" />
              Mock Users
            </TabsTrigger> */}
            </TabsList>

            <TabsContent value="email">
              <EmailLoginForm
                onLogin={onLogin}
                onSwitchToRegister={() => setActiveTab("register")}
              />
            </TabsContent>

            {/* <TabsContent value="email-link">
            <EmailLinkLoginForm />
          </TabsContent> */}

            <TabsContent value="register">
              <RegisterForm
                onLogin={onLogin}
                onSwitchToEmailLogin={() => setActiveTab("email")}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserMenuNew;
