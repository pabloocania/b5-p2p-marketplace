import { useState, useEffect } from "react";
import CreateOrder from "../src/components/kioscoin/orders/CreateOrder";
import OrdersFeed, {
  Filter,
} from "../src/components/kioscoin/orders/OrdersFeed";
import { Button } from "@/components/ui/button";
import { Plus, User, Languages, HelpCircle } from "lucide-react";
import { useUserContext } from "../src/components/kioscoin/users/UserContext";
import { useDisconnect } from "wagmi";
import { useTransaction } from "@/components/web3/Transactions/TransactionContext";
import { TransactionStatus } from "@/components/kioscoin/TransactionStatus";
import UserOrdersMenu from "@/components/kioscoin/TopLevelSubMenu";
import { useTranslation } from "react-i18next";
import { TopBar } from "@/components/kioscoin/TopBar";
import OrderCreationFlow from "@/components/kioscoin/orders/OrderCreationFlow";
import { CreateOrderContainer } from "@/components/kioscoin/orders/CreateOrderContainer";
import UserMenuNew from "@/components/kioscoin/users/UserMenuNew";
import { HelpDialog } from "@/components/kioscoin/HelpDialog";
import SmartWalletOnboarding from "@/components/kioscoin/users/SmartWalletOnboarding";

export default function Home() {
  const [activeComponent, setActiveComponent] = useState("OrderFeed");
  const [activeSubFilter, setActiveSubFilter] = useState(Filter.PENDING);
  const { user, login, logout } = useUserContext();
  const [refreshKey, setRefreshKey] = useState(0);
  const { disconnect } = useDisconnect();
  const { transaction, resetTransaction } = useTransaction();
  const { i18n, t } = useTranslation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [showSmartWalletOnboarding, setShowSmartWalletOnboarding] =
    useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    if (!user) {
      setActiveComponent("OrderFeed");
    }
  }, [user, disconnect]);

  useEffect(() => {
    if (user && !localStorage.getItem("hasSeenSmartWalletOnboarding")) {
      setTimeout(() => {
        setShowSmartWalletOnboarding(true);
        localStorage.setItem("hasSeenSmartWalletOnboarding", "true");
      }, 600);
    }
  }, [user]);

  const handleCreateOrderClose = () => {
    setIsCreateOrderOpen(false);
    setRefreshKey((prevKey) =>
      prevKey >= Number.MAX_SAFE_INTEGER ? 0 : prevKey + 1
    );
  };

  const handleUserMenuOpen = () => {
    setIsCreateOrderOpen(false);
    setIsUserMenuOpen(true);
  };

  const renderComponent = () => {
    if (activeComponent === "OrderFeed") {
      return <OrdersFeed refreshKey={refreshKey} />;
    } else if (activeComponent === "UserMenu") {
      return <UserMenuNew user={user} onLogin={login} onLogout={logout} />;
    } else if (activeComponent === "MyOrders") {
      return (
        <UserOrdersMenu
          activeSubFilter={activeSubFilter}
          setActiveSubFilter={setActiveSubFilter}
          refreshKey={refreshKey}
          user={user}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full bg-backgroundMain flex flex-col relative h-screen">
        <TopBar
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
        />

        <main className="flex-1 overflow-y-auto pb-36">
          <TransactionStatus
            status={transaction.status}
            message={transaction.message}
            progress={transaction.progress}
            order={transaction.order}
            onClose={resetTransaction}
          />
          <div className="w-full max-w-md mx-auto py-2 px-4">
            <OrderCreationFlow />
            {renderComponent()}
          </div>
        </main>

        <div className="fixed bottom-0 w-full pb-4 pt-8">
          <div className="relative px-4">
            <div className="absolute bottom-4 left-4">
              <Button
                size="icon"
                className="bg-white border-2 border-secondary text-primary hover:bg-primary/90 hover:text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
                onClick={() =>
                  changeLanguage(i18n.language === "en" ? "es" : "en")
                }
              >
                <Languages className="h-5 w-5 pr-1" />
                {i18n.language === "en" ? " ESP" : " ENG"}
                <span className="sr-only">Change Language</span>
              </Button>
            </div>
            <div className="absolute bottom-4 right-4">
              <CreateOrderContainer
                open={isCreateOrderOpen}
                onOpenChange={(open) => {
                  setIsCreateOrderOpen(open);
                  if (!open) handleCreateOrderClose();
                }}
                trigger={
                  <Button
                    size="icon"
                    className="rounded-full px-5 text-lg font-bold w-30 h-14 shadow-lg hover:bg-terciary/90 bg-white border-2 border-secondary text-primary"
                    disabled={!user}
                  >
                    <Plus className="h-6 w-6 pr-2" />
                    <span className="transition-opacity duration-500">
                      {t("create_order")}
                    </span>
                  </Button>
                }
              >
                <CreateOrder
                  onClose={handleCreateOrderClose}
                  onConnectWallet={handleUserMenuOpen}
                />
              </CreateOrderContainer>
            </div>
            <div className="absolute bottom-4 right-20">
              <Button
                size="icon"
                className="rounded-full w-14 h-14 shadow-lg text-white bg-primary hover:bg-terciary/90"
                onClick={() => setIsHelpOpen(true)}
              >
                <HelpCircle className="h-6 w-6" />
                <span className="sr-only">Help & Tutorials</span>
              </Button>
            </div>
          </div>
        </div>

        <HelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
        {showSmartWalletOnboarding && (
          <SmartWalletOnboarding
            onComplete={() => setShowSmartWalletOnboarding(false)}
          />
        )}
      </div>
    </div>
  );
}
