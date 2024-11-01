import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import CreateOrder from "../src/components/ui/CreateOrder";
import OrdersFeed, { Filter } from "../src/components/ui/OrdersFeed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, User } from "lucide-react";
import UserMenu from "../src/components/ui/UserMenu";
import { useUserContext } from "../src/components/ui/UserContext";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDisconnect } from "wagmi";
import { useTransaction } from "@/lib/web3/TransactionContext";
import { TransactionStatus } from "@/components/ui/TransactionStatus";

export default function Home() {
  const [activeComponent, setActiveComponent] = useState("OrderFeed");
  const [activeSubFilter, setActiveSubFilter] = useState(Filter.PENDING);
  const { user, login, logout } = useUserContext();
  const [isLoginSheetOpen, setIsLoginSheetOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { disconnect } = useDisconnect();
  const { transaction, resetTransaction } = useTransaction();

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
      return <UserMenu user={user} onLogin={login} onLogout={logout} />;
    } else if (activeComponent === "MyOrders") {
      return (
        <>
          {/* <div className="w-[90vw] border border-black max-w-md p-5 flex justify-center rounded-lg space-x-2"> */}
          <div className="max-w-md max-w-md p-2 flex justify-center rounded-lg space-x-2">
            <div className="flex w-full space-x-2">
              <Button
                className="flex-1 border border-black"
                variant={
                  activeSubFilter === Filter.PENDING ? "default" : "outline"
                }
                onClick={() => setActiveSubFilter(Filter.PENDING)}
              >
                Pending
              </Button>
              <Button
                className="flex-1 border border-black"
                variant={
                  activeSubFilter === Filter.WAITING_PAYMENT
                    ? "default"
                    : "outline"
                }
                onClick={() => setActiveSubFilter(Filter.WAITING_PAYMENT)}
              >
                On Going
              </Button>
              <Button
                className="flex-1 border border-black"
                variant={
                  activeSubFilter === Filter.CLOSED ? "default" : "outline"
                }
                onClick={() => setActiveSubFilter(Filter.CLOSED)}
              >
                Closed
              </Button>
            </div>
          </div>
          <OrdersFeed
            filter={activeSubFilter}
            refreshKey={refreshKey}
            resetSelectedOrder={true}
          />
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-2 border rounded-t border-black">
      <div className="container mx-auto">
        <main className={styles.main}>
          <TransactionStatus
            status={transaction.status}
            message={transaction.message}
            progress={transaction.progress}
            onClose={resetTransaction}
          />
          <div className="flex justify-center mb-2">
            <div className="w-[90vw] border border-black bg-white max-w-md p-5 flex justify-center rounded-lg space-x-2">
              <div className="flex w-full space-x-2">
                <Button
                  className="flex-1 border border-black"
                  variant={
                    activeComponent === "OrderFeed" ? "default" : "outline"
                  }
                  onClick={() => setActiveComponent("OrderFeed")}
                >
                  P2P Market
                </Button>
                <Button
                  className="flex-1 border border-black"
                  variant={
                    activeComponent === "MyOrders" ? "default" : "outline"
                  }
                  onClick={() => setActiveComponent("MyOrders")}
                >
                  My Orders
                </Button>
                <Button
                  className="flex-1 border border-black"
                  variant={
                    activeComponent === "UserMenu" ? "default" : "outline"
                  }
                  onClick={handleUserMenuOpen}
                >
                  Profile
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-[90vw] border border-black max-w-md bg-white p-4 rounded-lg shadow-md min-h-[300px]">
              {renderComponent()}
            </div>
          </div>
          <div className="fixed bottom-4 left-4">
            <Button
              size="icon"
              className="rounded-full w-14 h-14 shadow-lg"
              onClick={handleUserMenuOpen}
            >
              <User className="h-6 w-6" />
              <span className="sr-only">User Menu</span>
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
                  className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg"
                  disabled={!user}
                >
                  <Plus className="h-6 w-6" />
                  <span className="sr-only">Create Order</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh]">
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
