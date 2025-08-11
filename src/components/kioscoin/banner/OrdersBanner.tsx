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

import PaymentMethodDisplay from "../PaymentMethodDisplay";
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
              className={`w-[85%] max-w-[320px] sm:max-w-[380px] flex-shrink-0 flex-grow-0 px-2 sm:px-3`}
            >
              <Card
                className="h-full shadow rounded-lg border-0 cursor-pointer transition-transform hover:scale-[1.01] p-0 flex flex-col justify-between min-h-[80px] sm:min-h-[90px] md:min-h-[100px] max-w-[300px] sm:max-w-[360px]"
                onClick={() => handleCardClick(offer)}
              >
                <div className="flex-1 p-1.5 sm:p-2 flex flex-col">
                  {/* Header with crypto icon and amount */}
                  <div className="flex mb-2 sm:mb-2.5 ml-3 mt-1">
                    <div className="flex items-center text-[10px] text-primary/80 font-bold mr-1">
                      {offer.type === "BUY" ? t("buy") : t("sell")}
                    </div>
                    <CryptoAmountIcon
                      tokenCode={offer.tokenCode}
                      formattedAmount={offer.tokenAmount}
                      showAmount={true}
                      textSizeClass="text-[10px]"
                      amountTextClassName="text-gray-500 font-medium mr-1"
                    />
                    <div className="flex items-center text-[10px] text-primary/80 font-bold ml-1">
                      {t("instantly")}
                    </div>
                  </div>

                  {/* Two column layout */}
                  <div className="flex flex-1 gap-1.5 sm:gap-3">
                    {/* Left column: order type, fiat, blockchain */}
                    <div className="flex-1 flex flex-col items-start ml-3 justify-end -mt-2 sm:-mt-1.5">
                      <div className="text-[10px] text-primary/80">
                        {t("for")}{" "}
                        <span className="font-medium text-gray-500 text-[10px]">
                          {formatFiatAmount(
                            offer.fiatAmount || "0",
                            offer.fiatCode
                          )}
                        </span>
                      </div>
                      <div className="text-[10px] text-primary/60 mt-0.5 sm:mt-1 mb-1">
                        {t("on")}{" "}
                        <span className="font-bold text-[10px]">
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
                  <Button className="w-full rounded-b-lg rounded-t-none text-[10px] font-semibold shadow-none border-t border-secondary/80 transition-colors bg-secondary/90 text-white hover:bg-secondary/80 hover:text-white py-0.5 sm:py-1">
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
