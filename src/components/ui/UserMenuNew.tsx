import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useTranslation } from "react-i18next";
import { Mail, User, Key, UserPlus } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProps } from "../../lib/useUser";
import {
  UserProfile,
  EmailLoginForm,
  EmailLinkLoginForm,
  RegisterForm,
  MockUsersList,
} from "../login";

interface UserMenuNewProps {
  readonly user: UserProps | undefined;
  readonly onLogin: (user: UserProps) => void;
  readonly onLogout: () => void;
}

const UserMenuNew = ({ user, onLogin, onLogout }: UserMenuNewProps) => {
  const [mockUsers, setMockUsers] = useState<UserProps[]>([]);
  const { isConnected } = useAccount();
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectModalOpen } = useConnectModal();
  const [activeTab, setActiveTab] = useState("mock");

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
    <Card className="w-full mb-4 border-none" variant="shadow">
      <CardHeader></CardHeader>
      <CardContent className="py-4">
        <Tabs
          defaultValue="mock"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 mb-3 bg-primary/10">
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
            <TabsTrigger value="mock" className="text-primary">
              <User className="mr-2 h-4 w-4 text-primary" />
              Mock Users
            </TabsTrigger>
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

          <TabsContent value="mock" className="space-y-4">
            <MockUsersList mockUsers={mockUsers} onLogin={onLogin} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserMenuNew;
