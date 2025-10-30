import { useState, useEffect } from "react";
import CreateOrder from "../src/components/kioscoin/orders/create-orders/CreateOrderForm";
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
import { NavBar } from "@/components/kioscoin/NavBar";
import { TopBar } from "@/components/kioscoin/TopBar";
import { LandingPage } from "@/components/kioscoin/landing/LandingPage";
import KioscoinOperationFlow from "@/components/kioscoin/orders/KioscoinOperationFlow";
import { CreateOrderContainer } from "@/components/kioscoin/orders/create-orders/CreateOrderContainer";
import UserMenuNew from "@/components/kioscoin/users/UserMenuNew";
import { HelpDialog } from "@/components/kioscoin/HelpDialog";
import SmartWalletOnboarding from "@/components/kioscoin/users/SmartWalletOnboarding";

export default function Home() {
  const [activeComponent, setActiveComponent] = useState("OrderFeed");
  const [activeSubFilter, setActiveSubFilter] = useState(Filter.PENDING);
  const { user, login, logout } = useUserContext();

  const [refreshKey, setRefreshKey] = useState(0);
  const incrementRefreshKey = () => {
    setRefreshKey((prevKey) =>
      prevKey >= Number.MAX_SAFE_INTEGER ? 0 : prevKey + 1
    );
  };
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
    incrementRefreshKey();
  };

  const handleUserMenuOpen = () => {
    setIsCreateOrderOpen(false);
    setIsUserMenuOpen(true);
  };

  const handleOrderCreated = () => {
    setActiveComponent("MyOrders");
    setActiveSubFilter(Filter.WAITING_PAYMENT);
    incrementRefreshKey();
  };

  const renderComponent = () => {
    if (activeComponent === "OrderFeed") {
      return <OrdersFeed refreshKey={refreshKey} />;
    } else if (activeComponent === "UserMenu") {
      if (!user) {
        return <LandingPage />;
      }
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
    <div className="min-h-screen flex justify-center">
      <div className="w-full flex flex-col bg-secondary/10 relative h-screen">
        <main className="flex-1 overflow-y-auto pt-14 sm:pt-19 pb-20 sm:pb-24 md:pb-28 relative">
          <TopBar activeComponent={activeComponent} />
          <TransactionStatus
            status={transaction.status}
            message={transaction.message}
            progress={transaction.progress}
            order={transaction.order}
            onClose={resetTransaction}
          />
          <div className="w-full max-w-md mx-auto px-2 flex flex-col">
            <KioscoinOperationFlow
              activeComponent={activeComponent}
              onOrderCreated={handleOrderCreated}
            />
            <div className="flex-1">{renderComponent()}</div>
          </div>
        </main>

        <div className="pb-8 sm:pb-10">
          <NavBar
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
          />
        </div>

        <div className="fixed bottom-0 w-full pb-4 pt-6">
          <div className="relative px-2">
            <div className="absolute bottom-28 left-2 sm:left-4">
              <Button
                size="icon"
                className="rounded-md w-11 h-11 shadow-lg text-white bg-secondary/80 hover:bg-primary/80 hover:text-white"
                onClick={() => setIsHelpOpen(true)}
              >
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Help & Tutorials</span>
              </Button>
            </div>
            <div className="absolute bottom-16 left-2 sm:left-4">
              <Button
                size="icon"
                className="text-white bg-secondary/80 hover:bg-primary/80 hover:text-white rounded-md w-11 h-11 shadow-lg flex items-center justify-center font-secondary px-0.5"
                onClick={() =>
                  changeLanguage(i18n.language === "en" ? "es" : "en")
                }
              >
                <Languages className="h-5 w-5 pr-0.5" />
                <span className="text-xs sm:text-xs">
                  {i18n.language === "en" ? "ESP" : "ENG"}
                </span>
                <span className="sr-only">Change Language</span>
              </Button>
            </div>
            {user && (
              <div className="absolute bottom-16 right-2 sm:right-4 z-[100]">
                <CreateOrderContainer
                  open={isCreateOrderOpen}
                  onOpenChange={(open) => {
                    setIsCreateOrderOpen(open);
                    if (!open) handleCreateOrderClose();
                  }}
                  trigger={
                    <Button
                      size="icon"
                      className="rounded-md px-2 text-sm font-bold w-22 h-10 shadow-lg text-white bg-secondary/80 hover:bg-primary/80 hover:text-white"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 pr-0.5 sm:pr-1" />
                      <span className="transition-opacity duration-500 text-md font-secondary">
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
