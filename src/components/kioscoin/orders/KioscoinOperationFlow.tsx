"use client";

import { useEffect, useState } from "react";
import OrdersBanner from "../banner/OrdersBanner";
import { OrderOffer } from "b5-api-client";
import { useUserContext } from "../users/UserContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EmailLoginForm } from "@/components/kioscoin/users/login/EmailLoginForm";
import { RegisterForm } from "@/components/kioscoin/users/login/RegisterForm";
import { CreateOrderContainer } from "./create-orders/CreateOrderContainer";
import { useTranslation } from "react-i18next";
import { BuyOperationForm } from "./operation/BuyOperationForm";
import { SellOperationForm } from "./operation/SellOperationForm";

export default function KioscoinOperationFlow({
  activeComponent,
}: {
  activeComponent: string;
}) {
  const [isOperationOpen, setIsOperationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OrderOffer | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
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
      {!(activeComponent === "UserMenu" && !user) && (
        <OrdersBanner onOfferClick={handleOfferClick} />
      )}
      <Sheet open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <SheetTrigger asChild>
          <div />
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="h-[75vh] font-secondary"
          closeText={t("close")}
        >
          <div className="w-full h-full overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-4">
              <div className="flex bg-gray-100 rounded-lg p-1 mb-3">
                <button
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                    authMode === "login"
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t("login")}
                </button>
                <button
                  onClick={() => setAuthMode("register")}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                    authMode === "register"
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t("register")}
                </button>
              </div>

              <div className="min-h-[220px]">
                {authMode === "login" ? (
                  <EmailLoginForm
                    onLogin={login}
                    onSwitchToRegister={() => setAuthMode("register")}
                  />
                ) : (
                  <RegisterForm
                    onLogin={login}
                    onSwitchToEmailLogin={() => setAuthMode("login")}
                  />
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <CreateOrderContainer
        open={isOperationOpen}
        onOpenChange={setIsOperationOpen}
        variant="sheet"
        closeButtonPosition="right-5 top-12"
      >
        {selectedOffer &&
          (selectedOffer.type === "BUY" ? (
            <BuyOperationForm offer={selectedOffer} onCancel={handleClose} />
          ) : (
            <SellOperationForm
              offer={selectedOffer}
              onCancel={handleClose}
              onLockFundsSuccess={handleClose}
            />
          ))}
      </CreateOrderContainer>
    </>
  );
}
