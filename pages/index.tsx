import { useState, useEffect } from "react";
import CreateOrder from "../src/components/kioscoin/orders/CreateOrder";
import OrdersFeed, {
  Filter,
} from "../src/components/kioscoin/orders/OrdersFeed";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, User, Languages, Globe } from "lucide-react";
import { useUserContext } from "../src/components/kioscoin/users/UserContext";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDisconnect } from "wagmi";
import { useTransaction } from "@/components/web3/Transactions/TransactionContext";
import { TransactionStatus } from "@/components/kioscoin/TransactionStatus";
import UserOrdersMenu from "@/components/kioscoin/TopLevelSubMenu";
import { useTranslation } from "react-i18next";
import { TopBar } from "@/components/kioscoin/TopBar";
import UserMenuNew from "@/components/kioscoin/users/UserMenuNew";

export default function Home() {
  const [activeComponent, setActiveComponent] = useState("OrderFeed");
  const [activeSubFilter, setActiveSubFilter] = useState(Filter.PENDING);
  const { user, login, logout } = useUserContext();
  const [refreshKey, setRefreshKey] = useState(0);
  const { disconnect } = useDisconnect();
  const { transaction, resetTransaction } = useTransaction();
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    if (!user) {
      setActiveComponent("OrderFeed");
    }
  }, [user, disconnect]);

  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const handleCreateOrderClose = () => {
    setIsCreateOrderOpen(false);
    setRefreshKey((prevKey) =>
      prevKey >= Number.MAX_SAFE_INTEGER ? 0 : prevKey + 1
    );
  };

  const handleUserMenuOpen = () => {
    setIsCreateOrderOpen(false);
    setActiveComponent("UserMenu");
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

        {/* Main scrollable area with padding bottom for buttons */}
        <main className="flex-1 overflow-y-auto pb-36">
          <TransactionStatus
            status={transaction.status}
            message={transaction.message}
            progress={transaction.progress}
            order={transaction.order}
            onClose={resetTransaction}
          />
          <div className="w-full max-w-md mx-auto py-2 px-4">
            {renderComponent()}
          </div>
        </main>

        {/* Fixed bottom buttons container */}
        <div className="fixed bottom-0 w-full pb-4 pt-8">
          <div className="relative px-4">
            <div className="absolute bottom-20 left-4">
              <Button
                size="icon"
                className="rounded-full w-14 h-14 shadow-lg text-white bg-primary hover:bg-terciary/90"
                onClick={handleUserMenuOpen}
              >
                <User className="h-6 w-6" />
                <span className="sr-only">User Menu</span>
              </Button>
            </div>
            <div className="absolute bottom-4 left-4">
              <Button
                size="icon"
                className="bg-primary hover:bg-terciary/90 rounded-full w-14 h-14 shadow-lg text-white flex items-center justify-center"
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
              <Sheet
                open={isCreateOrderOpen}
                onOpenChange={(open) => {
                  setIsCreateOrderOpen(open);
                  if (!open) handleCreateOrderClose();
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    className="rounded-full w-14 h-14 shadow-lg text-white bg-primary hover:bg-terciary/90"
                    disabled={!user}
                  >
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Create order</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="h-[90vh] bg-backgroundMain"
                  closeText={t("close")}
                >
                  <VisuallyHidden>
                    <SheetTitle>Create Order Dialog</SheetTitle>
                  </VisuallyHidden>
                  <CreateOrder
                    onClose={handleCreateOrderClose}
                    onConnectWallet={handleUserMenuOpen}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
