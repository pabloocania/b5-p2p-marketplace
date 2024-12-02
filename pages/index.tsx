import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import CreateOrder from "../src/components/ui/CreateOrder";
import OrdersFeed, { Filter } from "../src/components/ui/OrdersFeed";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, User, Languages, Globe } from "lucide-react";
import UserMenu from "../src/components/ui/UserMenu";
import { useUserContext } from "../src/components/ui/UserContext";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDisconnect } from "wagmi";
import { useTransaction } from "@/lib/web3/TransactionContext";
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import TopLevelSubMenu from "@/components/ui/TopLevelSubMenu";
import MainMenu from "@/components/ui/MainMenu";
import { useTranslation } from "react-i18next";
import { Separator } from "@radix-ui/react-separator";

export default function Home() {
  const [activeComponent, setActiveComponent] = useState("OrderFeed");
  const [activeSubFilter, setActiveSubFilter] = useState(Filter.PENDING);
  const { user, login, logout } = useUserContext();
  const [refreshKey, setRefreshKey] = useState(0);
  const { disconnect } = useDisconnect();
  const { transaction, resetTransaction } = useTransaction();
  const { i18n } = useTranslation();

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
      return (
        <div className="pt-5 rounded-lg max-w-md flex justify-center rounded-lg space-x-2">
          <OrdersFeed refreshKey={refreshKey} />
        </div>
      );
    } else if (activeComponent === "UserMenu") {
      return <UserMenu user={user} onLogin={login} onLogout={logout} />;
    } else if (activeComponent === "MyOrders") {
      return (
        <TopLevelSubMenu
          activeSubFilter={activeSubFilter}
          setActiveSubFilter={setActiveSubFilter}
          refreshKey={refreshKey}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-backgroundMain">
      <div className="container mx-auto">
        <main className={`${styles.main}`}>
          <TransactionStatus
            status={transaction.status}
            message={transaction.message}
            progress={transaction.progress}
            onClose={resetTransaction}
          />
          <div className="flex justify-center rounded-lg pb-4">
            <div className="w-[90vw] max-w-md rounded-lg">
              <MainMenu
                activeComponent={activeComponent}
                setActiveComponent={setActiveComponent}
                handleUserMenuOpen={handleUserMenuOpen}
              />
            </div>
          </div>
          <div className="flex justify-center rounded-lg">
            <div className="w-[90vw] max-w-md rounded-lg min-h-[300px]">
              {renderComponent()}
            </div>
          </div>
          <div className="fixed bottom-20 left-4">
            {" "}
            {/* Adjusted position */}
            <Button
              size="icon"
              className="rounded-full w-14 h-14 shadow-lg text-white"
              onClick={handleUserMenuOpen}
            >
              <User className="h-6 w-6" />
              <span className="sr-only">User Menu</span>
            </Button>
          </div>
          <div className="fixed bottom-4 left-4">
            <Button
              size="icon"
              className="rounded-full w-14 h-14 shadow-lg text-white flex items-center justify-center"
              onClick={() =>
                changeLanguage(i18n.language === "en" ? "es" : "en")
              }
            >
              <Languages className="h-5 w-5 pr-1" />
              {"  "}
              {i18n.language === "en" ? " ESP" : " ENG"}
              <span className="sr-only">Change Language</span>
            </Button>
          </div>
          <div className="fixed bottom-4 right-4">
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
                  className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg text-white"
                  disabled={!user}
                >
                  <Plus className="h-6 w-6" />
                  <span className="sr-only">Create order</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[90vh] bg-backgroundMain"
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
        </main>
        <footer className={styles.footer}></footer>
      </div>
    </div>
  );
}
