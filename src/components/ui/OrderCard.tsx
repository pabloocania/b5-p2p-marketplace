import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clipboard } from "lucide-react";
import {
  Order,
  OrderType,
  TakeSellOrderRequest,
  TakeBuyOrderRequest,
  UpdateOrderRequest,
  OrderStatus,
  PaymentMethod,
} from "b5-api-client";
import { p2pMarketAPIClient as client } from "../../lib/APIClients";
import { useUserContext } from "./UserContext";
import LockFundsButton from "@/lib/web3/LockFundsButton";
import ReleaseFundsButton from "@/lib/web3/ReleaseFundsButton";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import PaymentMethodDisplay from "./PaymentMethodDisplay";
import OrderStatusBar from "./OrderStatus";
import { useTranslation } from "react-i18next";
import { Rating } from "./Rating";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import OrderHistory from "./OrderHistory";
import OrderCardHeader from "./OrderCardHeader";
import OrderCardContent from "./OrderCardContent";
import OrderCardFooter from "./OrderCardFooter";

interface OrderCardProps {
  orderDTO: Order | undefined;
  showSelectButton?: boolean;
  onSelect?: (order: Order) => void;
  showDetails?: boolean;
  onBack?: () => void;
  onRefresh: () => void;
}

export function OrderCard({
  orderDTO,
  showSelectButton = true,
  onSelect,
  showDetails = false,
  onBack,
  onRefresh,
}: OrderCardProps) {
  const { t } = useTranslation();
  const [isIdSheetOpen, setIsIdSheetOpen] = useState(false); // Estado para controlar el Sheet
  const [walletAddress, setWalletAddress] = useState("");

  const [order, setOrder] = useState(orderDTO);
  const { user, isLoggedIn } = useUserContext();
  const { openConnectModal } = useConnectModal();

  const handleConnectButton = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  useEffect(() => {
    setOrder(orderDTO);
  }, [orderDTO]);

  function mapPaymentMethod(methodType: PaymentMethod): JSX.Element {
    const paymentMethodMap: { [key: string]: string } = {
      MERCADO_PAGO: "Fintech",
      FINTECH: "Fintech",
      BANK: "Bank transfer",
      // Add more mappings here
    };

    const methodDescription =
      paymentMethodMap[methodType.type] ?? "Unknown Method";
    const entity = methodType.entity ? (
      <strong>{methodType.entity}</strong>
    ) : null;
    const alias = methodType.alias ? <strong>{methodType.alias}</strong> : null;

    return (
      <>
        {methodDescription} {entity} {alias}
      </>
    );
  }

  if (!order) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("no_orders_available")}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-4" variant="shadow">
      <OrderStatusBar status={order.status ?? "Unknown"} />
      <OrderCardHeader order={order}></OrderCardHeader>
      <OrderCardContent
        order={order}
        user={user}
        showDetails={showDetails}
        walletAddress={walletAddress}
        setWalletAddress={setWalletAddress}
      />
      <OrderCardFooter
        order={order}
        user={user}
        walletAddress={walletAddress}
        onRefresh={onRefresh}
        showSelectButton={showSelectButton}
        showDetails={showDetails}
        onSelect={onSelect}
        setOrder={setOrder}
      />
      <Separator className="mb-2" />
      <a
        href="#"
        className="text-blue-500 underline hover:text-blue-700 cursor-pointer"
        onClick={(e) => {
          e.preventDefault(); // Evita redirección
          setIsIdSheetOpen(true); // Abre el Sheet al hacer clic en el ID
        }}
      >
        ID: {order.id}
      </a>

      {/* Sheet para el ID clickeable */}
      <Sheet open={isIdSheetOpen} onOpenChange={setIsIdSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl h-[90vh] flex flex-col overflow-hidden"
          closeText="Close"
        >
          {/* Header */}
          <SheetHeader className="text-center p-4">
            <SheetTitle>Order History 🕒</SheetTitle>
          </SheetHeader>

          {/* Main Content */}
          <div className="flex-grow overflow-y-auto px-4 max-h-[65vh]">
            <OrderHistory />
          </div>

          {/* Footer */}
          <div className="sticky bottom-20 p-4 border-t border-gray-200 bg-white flex justify-center">
            <SheetClose className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-md">
              Cerrar
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}
