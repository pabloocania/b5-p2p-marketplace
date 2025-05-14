"use client";

import { useState, useEffect } from "react";
import { BannerOffer } from "../banner/types";
import { transformBannerOfferToOrderRequest } from "../banner/utils";
import OrdersBanner from "../banner/OrdersBanner";
import CreateOrder from "./CreateOrder";
import { useUserContext } from "../users/UserContext";
import { useTranslation } from "react-i18next";
import { ConfigStore } from "@/lib/ConfigStore";
import { CreateOrderContainer } from "./CreateOrderContainer";
import { UserMenuSheet } from "../users/UserMenuSheet";

export default function OrderCreationFlow() {
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<BannerOffer | null>(null);
  const { user, login, logout } = useUserContext();
  const { t } = useTranslation();

  const handleOfferClick = (offer: BannerOffer) => {
    setSelectedOffer(offer);
    if (!user) {
      setIsLoginOpen(true);
    } else {
      setIsCreateOrderOpen(true);
    }
  };

  const handleClose = () => {
    setIsCreateOrderOpen(false);
    setSelectedOffer(null);
  };

  const handleConnectWallet = () => {
    setIsCreateOrderOpen(false);
  };

  const getPreFilledData = (offer: BannerOffer) => {
    const transformed = transformBannerOfferToOrderRequest(
      offer,
      user?.id,
      user?.username
    );
    const configStore = ConfigStore.getInstance();
    const blockchain = configStore
      .getBackendStablecoins()
      ?.supportedStablecoins.find(
        (stablecoin) => stablecoin.name === transformed.tokenCode
      )?.addresses[0]?.blockchain;
    return {
      type: transformed.type,
      amount: transformed.amount,
      tokenCode: transformed.tokenCode,
      fiatAmount: transformed.fiatAmount || "0",
      fiatCode: transformed.fiatCode as "ARS" | "EUR",
      paymentMethods: transformed.paymentMethods || [],
      description: transformed.description,
      blockchain: blockchain || "ARBITRUM_TESTNET",
      action:
        transformed.type === "BUY"
          ? t("buy_now", {
              amount: transformed.amount,
              crypto: transformed.tokenCode,
            })
          : t("sell_now", {
              amount: transformed.amount,
              crypto: transformed.tokenCode,
            }),
    };
  };

  // Watch for login success
  useEffect(() => {
    if (isLoginOpen && user) {
      setIsLoginOpen(false);
      setIsCreateOrderOpen(true);
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
        open={isCreateOrderOpen}
        onOpenChange={setIsCreateOrderOpen}
        variant="sheet"
      >
        {selectedOffer && (
          <CreateOrder
            onClose={handleClose}
            onConnectWallet={handleConnectWallet}
            preFilledData={getPreFilledData(selectedOffer)}
          />
        )}
      </CreateOrderContainer>
    </>
  );
}
