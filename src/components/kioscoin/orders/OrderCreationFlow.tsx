"use client";

import { useState } from "react";
import { BannerOffer } from "../banner/types";
import { transformBannerOfferToOrderRequest } from "../banner/utils";
import OrdersBanner from "../banner/OrdersBanner";
import CreateOrder from "./CreateOrder";
import { useUserContext } from "../users/UserContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { ConfigStore } from "@/lib/ConfigStore";

export default function OrderCreationFlow() {
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<BannerOffer | null>(null);
  const { user } = useUserContext();
  const { t } = useTranslation();

  const handleOfferClick = (offer: BannerOffer) => {
    setSelectedOffer(offer);
    setIsCreateOrderOpen(true);
  };

  const handleClose = () => {
    setIsCreateOrderOpen(false);
    setSelectedOffer(null);
  };

  const handleConnectWallet = () => {
    // Handle wallet connection
    setIsCreateOrderOpen(false);
  };

  const getPreFilledData = (offer: BannerOffer) => {
    const transformed = transformBannerOfferToOrderRequest(
      offer,
      user?.id,
      user?.username
    );

    // Get the blockchain name from the token address
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
      blockchain: blockchain || "ARBITRUM_TESTNET", // Default to ARBITRUM_TESTNET if not found
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

  return (
    <>
      <OrdersBanner onOfferClick={handleOfferClick} />

      <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
        <DialogContent className="max-w-2xl">
          {selectedOffer && (
            <CreateOrder
              onClose={handleClose}
              onConnectWallet={handleConnectWallet}
              preFilledData={getPreFilledData(selectedOffer)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
