"use client";

import { useEffect, useState } from "react";
import OrdersBanner from "../banner/OrdersBanner";
import { OrderOffer } from "b5-api-client";
import { useUserContext } from "../users/UserContext";
import { UserMenuSheet } from "../users/UserMenuSheet";
import { CreateOrderContainer } from "./create-orders/CreateOrderContainer";
import { useTranslation } from "react-i18next";
import { BuyOperationForm } from "./operation/BuyOperationForm";

export default function KioscoinOperationFlow() {
  const [isOperationOpen, setIsOperationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OrderOffer | null>(null);
  const { user, login, logout } = useUserContext();
  const { t } = useTranslation();

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
      <OrdersBanner onOfferClick={handleOfferClick} />
      <UserMenuSheet
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        user={user}
        onLogin={login}
        onLogout={logout}
      />
      <CreateOrderContainer
        open={isOperationOpen}
        onOpenChange={setIsOperationOpen}
        variant="sheet"
      >
        {selectedOffer &&
          (selectedOffer.type === "BUY" ? (
            <BuyOperationForm offer={selectedOffer} onCancel={handleClose} />
          ) : (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{t("sell")}</h3>
              <p className="text-sm text-muted-foreground">Coming soon.</p>
            </div>
          ))}
      </CreateOrderContainer>
    </>
  );
}
