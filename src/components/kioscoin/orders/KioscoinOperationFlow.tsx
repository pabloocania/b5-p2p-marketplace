"use client";

import { useEffect, useState } from "react";
import OrdersBanner from "../banner/OrdersBanner";
import { OrderOffer } from "b5-api-client";
import { useKioscoinUserContext } from "../users/KioscoinUserContext";
import { CreateOrderContainer } from "./create-orders/CreateOrderContainer";
import OperationForm from "./operation/OperationForm";
import KioscoinUserLoginFlow from "../users/KioscoinUserLoginFlow";

interface KioscoinOperationFlowProps {
  activeComponent: string;
  onOrderCreated: () => void;
}

export default function KioscoinOperationFlow({
  activeComponent,
  onOrderCreated,
}: KioscoinOperationFlowProps) {
  const [isOperationOpen, setIsOperationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OrderOffer | null>(null);
  const { user, login, logout } = useKioscoinUserContext();

  const handleOfferClick = (offer: OrderOffer) => {
    setSelectedOffer(offer);
    if (!user) {
      setIsLoginOpen(true);
    } else {
      setIsOperationOpen(true);
    }
  };

  const handleClose = () => {
    setIsOperationOpen(false);
    setSelectedOffer(null);
  };

  // After login, continue the flow
  useEffect(() => {
    if (isLoginOpen && user) {
      setIsLoginOpen(false);
      setIsOperationOpen(true);
    }
  }, [user, isLoginOpen]);

  return (
    <>
      {!(activeComponent === "UserMenu" && !user) && (
        <OrdersBanner onOfferClick={handleOfferClick} />
      )}
      <KioscoinUserLoginFlow
        variant="sheet"
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onLogin={login}
      />
      <CreateOrderContainer
        open={isOperationOpen}
        onOpenChange={setIsOperationOpen}
        variant="sheet"
        hideCloseButton
        className="px-2"
      >
        <div className="p-2 mx-auto max-w-md rounded-lg shadow-lg bg-secondary/10 border border-secondary/20">
          {selectedOffer && (
            <OperationForm
              offer={selectedOffer}
              onCancel={handleClose}
              onLockFundsSuccess={handleClose}
              onOrderCreated={onOrderCreated}
            />
          )}
        </div>
      </CreateOrderContainer>
    </>
  );
}
