import { useState, useEffect, useCallback } from "react";
import CreateOrder from "../src/components/kioscoin/orders/create-orders/CreateOrderForm";
import { Button } from "@/components/ui/button";
import { Plus, Languages, HelpCircle } from "lucide-react";
import { useKioscoinUserContext } from "../src/components/kioscoin/users/KioscoinUserContext";
import { useDisconnect } from "wagmi";
import { useTransaction } from "@/components/web3/Transactions/TransactionContext";
import { TransactionStatus } from "@/components/kioscoin/TransactionStatus";
import { useTranslation } from "react-i18next";
import { NavBar } from "@/components/kioscoin/NavBar";
import { TopBar } from "@/components/kioscoin/TopBar";
import { CreateOrderContainer } from "@/components/kioscoin/orders/create-orders/CreateOrderContainer";
import { HelpDialog } from "@/components/kioscoin/HelpDialog";
import SmartWalletOnboarding from "@/components/kioscoin/users/profile/SmartWalletOnboarding";
import TermsCondPrivacyPolicy from "@/components/kioscoin/T&C and PP/TermsCond&PrivacyPolicy";
import { MainViewRenderer } from "@/components/kioscoin/MainViewRenderer";
import {
  NavigationProvider,
  useNavigation,
  ActiveView,
} from "@/components/kioscoin/NavigationContext";
import { Filter } from "@/components/kioscoin/orders/OrdersFeed";
import { useDeepLink } from "@/hooks/useDeepLink";
import KioscoinUserLoginFlow from "@/components/kioscoin/users/KioscoinUserLoginFlow";

function HomeContent() {
  const { user, login, logout } = useKioscoinUserContext();
  const { currentView, navigate, pendingNavigation } = useNavigation();

  // Handle deeplink navigation
  const { requiresLogin } = useDeepLink(user);
  const [showDeepLinkLogin, setShowDeepLinkLogin] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const incrementRefreshKey = useCallback(() => {
    setRefreshKey((prevKey) =>
      prevKey >= Number.MAX_SAFE_INTEGER ? 0 : prevKey + 1
    );
  }, []);

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

  // Show login dialog when deeplink requires authentication
  useEffect(() => {
    if (requiresLogin && !user) {
      setShowDeepLinkLogin(true);
    }
  }, [requiresLogin, user]);

  // Close login dialog after successful login
  useEffect(() => {
    if (user && showDeepLinkLogin) {
      setShowDeepLinkLogin(false);
    }
  }, [user, showDeepLinkLogin]);

  useEffect(() => {
    // Only navigate to OrderFeed if there's no pending deeplink navigation
    if (!user && !pendingNavigation) {
      navigate("OrderFeed");
    }
  }, [user, disconnect, navigate, pendingNavigation]);

  useEffect(() => {
    if (user) {
      // Reset state to ensure modal shows every time user logs in
      setShowSmartWalletOnboarding(false);
      setTimeout(() => {
        setShowSmartWalletOnboarding(true);
        // Modal will show every time user logs in
      }, 600);
    } else {
      // Reset state when user logs out
      setShowSmartWalletOnboarding(false);
    }
  }, [user]);

  // iOS Safari fix: Force touch events to work on first load
  // by triggering a micro-scroll that activates the touch layer
  useEffect(() => {
    const activateTouchEvents = () => {
      window.scrollTo(0, 1);
      window.scrollTo(0, 0);
    };
    // Small delay to ensure DOM is ready
    const timer = setTimeout(activateTouchEvents, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateOrderClose = () => {
    setIsCreateOrderOpen(false);
    incrementRefreshKey();
  };

  const handleUserMenuOpen = () => {
    setIsCreateOrderOpen(false);
    setIsUserMenuOpen(true);
  };

  const handleOrderCreated = () => {
    navigate("MyOrders", { filter: Filter.WAITING_PAYMENT });
    incrementRefreshKey();
  };

  const handleSetActiveComponent = (view: ActiveView) => {
    navigate(view);
    incrementRefreshKey();
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-secondary/10">
      {/* Fixed TopBar */}
      <TopBar activeComponent={currentView} />

      {/* Main scrollable content */}
      <main className="absolute left-0 right-0 overflow-y-auto z-0 top-[var(--content-top)] bottom-[var(--content-bottom)]">
        <div className="w-full max-w-md mx-auto px-2 flex flex-col pb-4">
          <MainViewRenderer
            refreshKey={refreshKey}
            user={user}
            onLogin={login}
            onLogout={logout}
            onOrderCreated={handleOrderCreated}
          />
        </div>
      </main>

      {/* Fixed NavBar */}
      <NavBar
        activeComponent={currentView}
        setActiveComponent={handleSetActiveComponent}
      />

      {/* Floating action buttons - left side */}
      <div className="fixed left-2 sm:left-4 z-[55] flex flex-col gap-2 transform-gpu touch-manipulation bottom-[calc(var(--content-bottom)+1rem)]">
        <Button
          size="icon"
          className="rounded-md w-11 h-11 shadow-lg text-white bg-secondary/80 hover:bg-primary/80 hover:text-white touch-manipulation"
          onClick={() => setIsHelpOpen(true)}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help & Tutorials</span>
        </Button>
        <Button
          size="icon"
          className="text-white bg-secondary/80 hover:bg-primary/80 hover:text-white rounded-md w-11 h-11 shadow-lg flex items-center justify-center font-secondary px-0.5 touch-manipulation"
          onClick={() => changeLanguage(i18n.language === "en" ? "es" : "en")}
        >
          <Languages className="h-5 w-5 pr-0.5" />
          <span className="text-xs">
            {i18n.language === "en" ? "ESP" : "ENG"}
          </span>
          <span className="sr-only">Change Language</span>
        </Button>
      </div>

      {/* Floating create order button - right side */}
      {user && (
        <div className="fixed right-2 sm:right-4 z-[55] bottom-[calc(var(--content-bottom)+1rem)]">
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
            className="p-2"
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

      {/* Transaction status overlay - must be outside main for proper z-index stacking */}
      <TransactionStatus
        status={transaction.status}
        message={transaction.message}
        progress={transaction.progress}
        order={transaction.order}
        onClose={resetTransaction}
      />

      <HelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
      {showSmartWalletOnboarding && (
        <TermsCondPrivacyPolicy
          onComplete={() => setShowSmartWalletOnboarding(false)}
          onClose={logout}
        />
      )}

      {/* Deeplink login flow - shown when user opens a shared link without being logged in */}
      <KioscoinUserLoginFlow
        variant="sheet"
        open={showDeepLinkLogin}
        onOpenChange={setShowDeepLinkLogin}
        onLogin={login}
        showBrand={true}
      />
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
