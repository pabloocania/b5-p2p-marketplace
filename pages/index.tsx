import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
import { Plus, User, Languages, Globe, Loader2 } from "lucide-react";
import UserMenu from "../src/components/ui/UserMenu";
import { useUserContext } from "../src/components/ui/UserContext";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useDisconnect } from "wagmi";
import { useTransaction } from "@/lib/web3/TransactionContext";
import { TransactionStatus } from "@/components/ui/TransactionStatus";
import UserOrdersMenu from "@/components/ui/TopLevelSubMenu";
import MainMenu from "@/components/ui/MainMenu";
import { useTranslation } from "react-i18next";
import { initConfig } from "@/lib/ConfigStore";
import { OrderCard } from "@/components/ui/OrderCard";
import { Order } from "b5-api-client";
import { p2pMarketAPIClient as client } from "../src/lib/APIClients";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState("OrderFeed");
  const [activeSubFilter, setActiveSubFilter] = useState(Filter.PENDING);
  const { user, login, logout } = useUserContext();
  const [refreshKey, setRefreshKey] = useState(0);
  const { disconnect } = useDisconnect();
  const { transaction, resetTransaction } = useTransaction();
  const { i18n, t } = useTranslation();

  // Estados para el manejo de deeplinks
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    if (!user) {
      setActiveComponent("OrderFeed");
    }
  }, [user, disconnect]);

  // Manejar los parámetros de la URL
  useEffect(() => {
    if (router.isReady) {
      // Activar el componente especificado en la URL
      if (router.query.component) {
        setActiveComponent(router.query.component as string);
      }
    }
  }, [router.isReady, router.query.component]);

  useEffect(() => {
    const fetchOrderById = async (orderId: string) => {
      setIsLoadingOrder(true);
      setOrderError(null);

      try {
        const response = await client.getOrders({
          status: [
            "PENDING",
            "WAITING_PAYMENT",
            "ACTIVE",
            "FIAT_SENT",
            "RELEASED",
            "COMPLETED_BY_ADMIN",
          ],
        });

        if (response.orders && response.orders.length > 0) {
          const foundOrder = response.orders.find(
            (order) => order.id === orderId
          );
          if (foundOrder) {
            setSelectedOrder(foundOrder);
            setIsOrderSheetOpen(true);
          } else {
            setOrderError(t("order_not_found"));
          }
        } else {
          setOrderError(t("order_not_found"));
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        setOrderError(t("error_loading_order"));
      } finally {
        setIsLoadingOrder(false);
      }
    };

    if (router.query.orderId && typeof router.query.orderId === "string") {
      fetchOrderById(router.query.orderId);
    }
  }, [router.query.orderId, t]);

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

  // Manejar el cierre del Sheet
  const handleOrderSheetClose = () => {
    setIsOrderSheetOpen(false);
    setSelectedOrder(null);
    setOrderError(null);
    // Limpiar orderId de la URL sin recargar la página
    router.replace("/", undefined, { shallow: true });
  };

  const renderComponent = () => {
    if (activeComponent === "OrderFeed") {
      return (
        <div className="pt-5 rounded-lg max-w-md flex justify-center rounded-lg space-x-2">
          <OrdersFeed
            refreshKey={refreshKey}
            highlightedOrderId={router.query.orderId as string}
          />
        </div>
      );
    } else if (activeComponent === "UserMenu") {
      return <UserMenu user={user} onLogin={login} onLogout={logout} />;
    } else if (activeComponent === "MyOrders") {
      return (
        <UserOrdersMenu
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
            order={transaction.order}
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
          <Sheet
            open={isOrderSheetOpen}
            onOpenChange={(open) => {
              if (!open) handleOrderSheetClose();
            }}
          >
            <SheetContent
              side="bottom"
              className="h-[90vh] bg-backgroundMain"
              closeText={t("close")}
            >
              <SheetTitle>
                {!user ? t("select_user") : t("order_details")}
              </SheetTitle>
              {!user ? (
                <UserMenu
                  user={user}
                  onLogin={(selectedUser) => {
                    login(selectedUser);
                    // No cerramos el Sheet aquí, ya que el efecto se encargará de cargar la orden
                  }}
                  onLogout={logout}
                />
              ) : isLoadingOrder ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orderError ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{orderError}</AlertDescription>
                </Alert>
              ) : selectedOrder ? (
                <OrderCard
                  orderDTO={selectedOrder}
                  showDetails={true}
                  onRefresh={() => {
                    handleOrderSheetClose();
                    setRefreshKey((prev) => prev + 1);
                  }}
                />
              ) : null}
            </SheetContent>
          </Sheet>
        </main>
        <footer className={styles.footer}></footer>
      </div>
    </div>
  );
}
