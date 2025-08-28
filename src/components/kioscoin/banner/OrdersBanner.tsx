"use client";

import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState, useRef } from "react";
import { BannerOffer, BannerOfferClickHandler } from "./types";
import PaymentMethodDisplay from "../PaymentMethodDisplay";
import { CryptoAmountIcon } from "../CryptoIcon";
import { useTranslation } from "react-i18next";
import { formatFiatAmount } from "@/lib/utils";
import { ExchangeRatesService } from "@/components/web3/ExchangeRatesService";
import { getBlockchainDisplayName } from "@/lib/ConfigStore";

// Sample data for the crypto offers
const cryptoOffers: BannerOffer[] = [
  {
    id: "1",
    title: "Buy USDT at best rate",
    action: "Buy 1 USDT now",
    fiatAmount: "$1.00",
    exchangeMethods: [
      { type: "BANK", entity: "Revolut" },
      { type: "FINTECH", entity: "Mercado Pago" },
    ],
    type: "BUY",
    tokenCode: "USDC",
    blockchain: "BSC_MAINNET",
    amount: "1",
    fiatCode: "ARS",
  },
  {
    id: "2",
    title: "Sell USDC instantly",
    action: "Sell 1 USDC now",
    fiatAmount: "$0.99",
    exchangeMethods: [
      { type: "FINTECH", entity: "Mercado Pago" },
      { type: "BANK", entity: "Revolut" },
    ],
    type: "SELL",
    tokenCode: "USDC",
    blockchain: "BSC_MAINNET",
    amount: "1",
    fiatCode: "ARS",
  },
  {
    id: "3",
    title: "Sell USDK instantly",
    action: "Sell 1 USDK now",
    fiatAmount: "$0.99",
    exchangeMethods: [
      { type: "FINTECH", entity: "Mercado Pago" },
      { type: "BANK", entity: "Revolut" },
    ],
    type: "SELL",
    tokenCode: "USDK",
    blockchain: "ARBITRUM_TESTNET",
    amount: "1",
    fiatCode: "ARS",
  },
  {
    id: "4",
    title: "Sell USDK instantly",
    action: "Sell 1 USDK now",
    fiatAmount: "$0.99",
    exchangeMethods: [
      { type: "FINTECH", entity: "Mercado Pago" },
      { type: "BANK", entity: "Revolut" },
    ],
    type: "SELL",
    tokenCode: "USDK",
    blockchain: "ARBITRUM_TESTNET",
    amount: "1",
    fiatCode: "ARS",
  },
];

interface OrdersBannerProps {
  onOfferClick?: BannerOfferClickHandler;
}

export default function OrdersBanner({ onOfferClick }: OrdersBannerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [validOffers, setValidOffers] = useState<BannerOffer[]>([]);
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<any>(null);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const fetchRatesAndValidateOffers = async () => {
      try {
        // Fetch rates for each offer
        const offersWithRates = await Promise.all(
          cryptoOffers.map(async (offer) => {
            try {
              const rate = await ExchangeRatesService.fetchRateWithRetry(
                offer.tokenCode,
                offer.fiatCode
              );

              if (!rate) {
                return null;
              }

              const updatedOffer: BannerOffer = {
                ...offer,
                price: rate.toString(),
                crypto: offer.tokenCode,
              };

              return updatedOffer;
            } catch (error) {
              console.error(
                `Failed to fetch rate for ${offer.tokenCode}:`,
                error
              );
              return {
                ...offer,
                price: "1",
                crypto: offer.tokenCode,
              };
            }
          })
        );

        // Filter out offers with no valid rates
        const validOffers = offersWithRates.filter(
          (offer): offer is BannerOffer => offer !== null
        );
        setValidOffers(validOffers);
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        setValidOffers([]);
      }
    };

    fetchRatesAndValidateOffers();
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    onSelect();
    return () => carouselApi.off("select", onSelect);
  }, [carouselApi]);

  const handleCardClick = (offer: BannerOffer) => {
    if (onOfferClick) {
      onOfferClick(offer);
    }
  };

  if (validOffers.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full px-2 py-1 sm:px-4 sm:py-2 md:py-4 md:px-6 rounded-xl bg-secondary/40 shadow-lg mb-6 sm:mb-8 mt-6 sm:mt-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full relative"
        setApi={setCarouselApi}
      >
        <CarouselContent className="flex-nowrap">
          {validOffers.map((offer, idx) => (
            <CarouselItem
              key={offer.id}
              className={`w-[80%] max-w-[256px] sm:max-w-[304px] flex-shrink-0 flex-grow-0 px-2 sm:px-3`}
            >
              <Card
                className="h-full shadow rounded-lg border-0 cursor-pointer transition-transform hover:scale-[1.01] p-0 flex flex-col justify-between min-h-[90px] sm:min-h-[110px] md:min-h-[140px] max-w-[240px] sm:max-w-[288px]"
                onClick={() => handleCardClick(offer)}
              >
                <div className="flex-1 p-1.5 sm:p-2 flex flex-col">
                  {/* Header with crypto icon and amount */}
                  <div className="flex mb-0.5 sm:mb-1">
                    <div className="flex items-end text-lg sm:text-xl text-primary font-bold mr-1">
                      {offer.type === "BUY" ? t("buy") : t("sell")}
                    </div>
                    <CryptoAmountIcon
                      tokenCode={offer.crypto || offer.tokenCode}
                      formattedAmount={offer.amount}
                      showAmount={true}
                      textSizeClass="text-xl sm:text-2xl"
                    />
                    <div className="flex items-end text-lg sm:text-xl text-primary font-bold ml-1">
                      {t("instantly")}
                    </div>
                  </div>

                  {/* Two column layout */}
                  <div className="flex flex-1 gap-1.5 sm:gap-3">
                    {/* Left column: order type, fiat, blockchain */}
                    <div className="flex-1">
                      <div className="text-sm sm:text-base">
                        {t("for")}{" "}
                        <span className="font-bold text-black">
                          {formatFiatAmount(offer.price || "0", offer.fiatCode)}
                        </span>
                      </div>
                      <div className="text-xs text-primary mt-0.5 sm:mt-1">
                        {t("on")}{" "}
                        <span className="font-bold">
                          {getBlockchainDisplayName(offer.blockchain)}
                        </span>
                      </div>
                    </div>

                    {/* Right column: payment methods stacked vertically */}
                    <div className="flex flex-col">
                      {offer.exchangeMethods.map((method, idx) => (
                        <PaymentMethodDisplay key={idx} method={method} />
                      ))}
                    </div>
                  </div>
                </div>
                <CardFooter className="p-0">
                  <Button className="w-full rounded-b-lg rounded-t-none text-xs sm:text-sm font-semibold shadow-none border-t border-secondary transition-colors bg-secondary text-white hover:bg-white/10 hover:text-secondary py-1 sm:py-2">
                    {offer.type === "BUY" ? t("buy") : t("sell")}
                  </Button>
                </CardFooter>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {currentIndex > 0 && (
          <CarouselPrevious className="pointer-events-auto absolute left-0 -ml-2 sm:-ml-6 top-1/2 -translate-y-1/2 z-20 text-primary bg-secondary text-white border-primary" />
        )}
        {currentIndex < validOffers.length - 1 && (
          <CarouselNext className="pointer-events-auto absolute right-0 -mr-2 sm:-mr-6 top-1/2 -translate-y-1/2 z-20 text-primary bg-secondary text-white border-primary" />
        )}
      </Carousel>
    </div>
  );
}
