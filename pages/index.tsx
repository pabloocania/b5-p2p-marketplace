import { useState, useEffect } from "react";
import CreateOrder from "../src/components/kioscoin/orders/create-orders/CreateOrder";
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
import { CreateOrderContainer } from "@/components/kioscoin/orders/create-orders/CreateOrderContainer";
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
        <main className="flex-1 overflow-hidden pb-20 sm:pb-24 md:pb-28 relative">
          <TransactionStatus
            status={transaction.status}
            message={transaction.message}
            progress={transaction.progress}
            order={transaction.order}
            onClose={resetTransaction}
          />
          <div className="w-full max-w-md mx-auto py-0.5 sm:py-1 md:py-2 px-2 sm:px-4 h-full flex flex-col">
            <OrderCreationFlow activeComponent={activeComponent} />
            <div className="flex-1 min-h-0">{renderComponent()}</div>
          </div>
        </main>

        <div className="pb-8 sm:pb-10">
          <TopBar
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
          />
        </div>

        <div className="fixed bottom-0 w-full pb-8 sm:pb-10 pt-6 sm:pt-8">
          <div className="relative px-2 sm:px-4">
            <div className="absolute bottom-24 sm:bottom-28 left-2 sm:left-4">
              <Button
                size="icon"
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 shadow-lg text-white bg-primary hover:bg-terciary/90"
                onClick={() => setIsHelpOpen(true)}
              >
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Help & Tutorials</span>
              </Button>
            </div>
            <div className="absolute bottom-12 sm:bottom-16 left-2 sm:left-4">
              <Button
                size="icon"
                className="bg-white border-2 border-secondary text-primary hover:bg-primary/90 hover:text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 shadow-lg flex items-center justify-center"
                onClick={() =>
                  changeLanguage(i18n.language === "en" ? "es" : "en")
                }
              >
                <Languages className="h-4 w-4 sm:h-5 sm:w-5 pr-0.5 sm:pr-1" />
                <span className="text-xs sm:text-sm">
                  {i18n.language === "en" ? "ESP" : "ENG"}
                </span>
                <span className="sr-only">Change Language</span>
              </Button>
            </div>
            {user && (
              <div className="absolute bottom-12 sm:bottom-16 right-2 sm:right-4">
                <CreateOrderContainer
                  open={isCreateOrderOpen}
                  onOpenChange={(open) => {
                    setIsCreateOrderOpen(open);
                    if (!open) handleCreateOrderClose();
                  }}
                  trigger={
                    <Button
                      size="icon"
                      className="rounded-full px-3 sm:px-4 text-sm sm:text-base font-bold w-22 h-10 sm:w-28 sm:h-12 shadow-lg hover:bg-terciary/90 bg-white border-2 border-secondary text-primary"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 pr-0.5 sm:pr-1" />
                      <span className="transition-opacity duration-500 text-xs sm:text-sm">
                        {t("create_order")}
                      </span>
                    </Button>
                  }
                >
                  <CreateOrder
                    onClose={handleCreateOrderClose}
                    onConnectWallet={handleUserMenuOpen}
                    preFilledData={{
                      fiatCode: "ARS",
                      paymentMethods: [],
                    }}
                  />
                </CreateOrderContainer>
              </div>
            )}
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
