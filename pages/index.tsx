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

export default function Home() {
  const [activeComponent, setActiveComponent] = useState("OrderFeed");
  const [activeSubFilter, setActiveSubFilter] = useState(Filter.PENDING);
  const { user, login, logout } = useUserContext();
  const [isLoginSheetOpen, setIsLoginSheetOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) {
      setActiveComponent("OrderFeed");
    }
  }, [user]);

  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const handleCreateOrderClose = () => {
    setIsCreateOrderOpen(false);
    console.log("CreateOrder component is closed");
    setRefreshKey((prevKey) =>
      prevKey >= Number.MAX_SAFE_INTEGER ? 0 : prevKey + 1
    );
  };

  const renderComponent = () => {
    if (activeComponent === "OrderFeed") {
      return <OrdersFeed refreshKey={refreshKey} />;
    } else if (activeComponent === "UserMenu") {
      return <UserMenu user={user} onLogin={login} onLogout={logout} />;
    } else if (activeComponent === "MyOrders") {
      return (
        <>
          <div className="flex space-x-2 my-4">
            <Button
              variant={
                activeSubFilter === Filter.PENDING ? "default" : "secondary"
              }
              onClick={() => setActiveSubFilter(Filter.PENDING)}
            >
              Pending
            </Button>
            {/* {tabCounts[filter] > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 px-2 py-0.5 text-xs"
              >
                {tabCounts[filter]}
              </Badge>
            )} */}
            <Button
              variant={
                activeSubFilter === Filter.WAITING_PAYMENT
                  ? "default"
                  : "secondary"
              }
              onClick={() => setActiveSubFilter(Filter.WAITING_PAYMENT)}
            >
              On Going
            </Button>
            <Button
              variant={
                activeSubFilter === Filter.CLOSED ? "default" : "secondary"
              }
              onClick={() => setActiveSubFilter(Filter.CLOSED)}
            >
              Closed
            </Button>
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
    <div className="min-h-screen bg-gray-100 py-2">
      <div className="container mx-auto">
        <main className={styles.main}>
          <div className="flex space-x-2 my-4">
            <Button
              variant={
                activeComponent === "OrderFeed" ? "default" : "secondary"
              }
              onClick={() => setActiveComponent("OrderFeed")}
            >
              P2P Market
            </Button>
            <Button
              variant={activeComponent === "MyOrders" ? "default" : "secondary"}
              onClick={() => setActiveComponent("MyOrders")}
            >
              My Orders
            </Button>
            <Button
              variant={activeComponent === "UserMenu" ? "default" : "secondary"}
              onClick={() => setActiveComponent("UserMenu")}
            >
              Profile
            </Button>
          </div>
          {renderComponent()}
          <div className="fixed bottom-4 left-4">
            <Button
              size="icon"
              className="rounded-full w-14 h-14 shadow-lg"
              onClick={() => setActiveComponent("UserMenu")}
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
                  disabled={!user} // Disable button if user is not logged in
                >
                  <Plus className="h-6 w-6" />
                  <span className="sr-only">Create Order</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh]">
                <VisuallyHidden>
                  <SheetTitle>Create Order Dialog</SheetTitle>
                </VisuallyHidden>
                <CreateOrder onClose={handleCreateOrderClose} />
              </SheetContent>
            </Sheet>
          </div>
        </main>
        <footer className={styles.footer}></footer>
      </div>
    </div>
  );
}
