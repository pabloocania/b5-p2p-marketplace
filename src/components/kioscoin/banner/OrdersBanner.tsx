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
import { BannerOfferClickHandler } from "./types";

import PaymentMethodDisplay, { EntityBadge } from "../PaymentMethodDisplay";
import { CryptoAmountIcon } from "../CryptoIcon";
import { useTranslation } from "react-i18next";
import { formatFiatAmount } from "@/lib/utils";
import { ExchangeRatesService } from "@/components/web3/ExchangeRatesService";
import { getBlockchainDisplayName } from "@/lib/ConfigStore";
import { p2pMarketAPIClient } from "@/lib/APIClients";
import { OrderOffer } from "b5-api-client";

interface OrdersBannerProps {
  onOfferClick?: BannerOfferClickHandler;
}

export default function OrdersBanner({ onOfferClick }: OrdersBannerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [validOffers, setValidOffers] = useState<OrderOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<any>(null);

  const formatAlias = (alias: string | undefined): string => {
    return alias?.startsWith("@") ? alias : `${alias}`;
  };

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
    const fetchOrderOffers = async () => {
      try {
        setIsLoading(true);
        const response = await p2pMarketAPIClient.getOrderOffers();

        // Check if response or offers is empty
        if (!response?.offers || response.offers.length === 0) {
          console.log("No order offers available");
          setShouldRender(false);
          return;
        }

        // Fetch rates for each offer
        const offersWithRates = await Promise.all(
          response.offers.map(async (offer) => {
            try {
              const rate = await ExchangeRatesService.fetchRateWithRetry(
                offer.tokenCode,
                offer.fiatCode
              );

              if (!rate) {
                return null;
              }

              const updatedOffer: OrderOffer = {
                ...offer,
                fiatAmount: rate.toString(),
              };

              return updatedOffer;
            } catch (error) {
              console.error(
                `Failed to fetch rate for ${offer.tokenCode}:`,
                error
              );
              return {
                ...offer,
                fiatAmount: "1",
              };
            }
          })
        );

        // Filter out offers with no valid rates
        const validOffers = offersWithRates.filter(
          (offer): offer is OrderOffer => offer !== null
        );

        if (validOffers.length === 0) {
          console.log("No valid offers after rate fetching");
          setShouldRender(false);
          return;
        }

        setValidOffers(validOffers);
        setShouldRender(true);
      } catch (error) {
        console.error("Failed to fetch order offers:", error);
        setShouldRender(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderOffers();
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    onSelect();
    return () => carouselApi.off("select", onSelect);
  }, [carouselApi]);

  const handleCardClick = (offer: OrderOffer) => {
    if (onOfferClick) {
      onOfferClick(offer);
    }
  };

  // Don't render anything if we shouldn't render or if loading/no offers
  if (!shouldRender || isLoading || validOffers.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full border border-secondary/20 px-4 py-2 rounded-xl bg-white shadow-lg mb-4 mt-6">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full relative"
        setApi={setCarouselApi}
      >
        <CarouselContent className="flex-nowrap font-secondary">
          {validOffers.map((offer, idx) => (
            <CarouselItem key={offer.id} className="flex-shrink-0 flex-grow-0">
              <Card
                className="h-full bg-secondary/10 shadow rounded-lg border-0 cursor-pointer text-white transition-transform hover:scale-[1.01] flex flex-col justify-between min-h-[80px] sm:min-h-[90px] md:min-h-[100px] border border-secondary/10"
                onClick={() => handleCardClick(offer)}
              >
                <div className="flex-1 p-2 flex flex-col">
                  {/* Header with crypto icon and amount */}
                  <div className="flex flex space-x-1 items-baseline font-bold">
                    <span className="text-base text-primary text-lg">
                      {offer.type === "BUY" ? t("buy") : t("sell")}
                    </span>
                    <span className="flex">
                      <CryptoAmountIcon
                        tokenCode={offer.tokenCode}
                        formattedAmount={offer.tokenAmount}
                        showAmount={true}
                        textSizeClass="text-dark font-bold text-lg"
                      />
                    </span>
                  </div>

                  {/* Two column layout */}
                  <div className="flex flex-1 gap-1.5 sm:gap-3">
                    {/* Left column: order type, fiat, blockchain */}
                    <div className="flex-1 flex flex-col items-start justify-end">
                      <div className="text-sm text-primary">
                        {t("for")}{" "}
                        <span className="text-dark text-sm">
                          {formatFiatAmount(
                            offer.fiatAmount || "0",
                            offer.fiatCode
                          )}
                        </span>
                      </div>
                      <div className="text-sm text-primary mt-1 mb-1">
                        {t("on")}{" "}
                        <span className="font-bold text-sm text-dark">
                          {getBlockchainDisplayName(offer.blockchain)}
                        </span>
                      </div>
                    </div>

                    {/* Right column: payment methods stacked vertically */}
                    <div className="flex flex-col items-start justify-end">
                      {offer.exchangeMethods.map((method, idx) => (
                        <PaymentMethodDisplay key={idx} method={method} />
                      ))}
                    </div>
                  </div>
                </div>
                <CardFooter className="p-0">
                  <Button className="w-full bg-secondary text-white font-secondary rounded-b-lg rounded-t-none py-0.5">
                    {offer.type === "BUY" ? t("buy") : t("sell")}{" "}
                    {offer.tokenCode} {t("instantly")}
                  </Button>
                </CardFooter>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {currentIndex > 0 && (
          <CarouselPrevious className="pointer-events-auto absolute left-0 -ml-4 top-1/2 -translate-y-1/2 z-20 text-primary bg-secondary/80 text-white" />
        )}
        {currentIndex < validOffers.length - 1 && (
          <CarouselNext className="pointer-events-auto absolute right-0 -mr-4 top-1/2 -translate-y-1/2 z-20 text-primary bg-secondary/80 text-white" />
        )}
      </Carousel>
    </div>
  );
}
