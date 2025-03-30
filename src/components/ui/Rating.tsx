"use client";

import { useState } from "react";
import { Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { p2pMarketAPIClient as client } from "../../lib/APIClients";
import { useTranslation } from "react-i18next";

interface RatingProps {
  orderId: string;
  ratedId: string;
  ratedUsername: string;
  onSubmit?: (rating: number) => void;
}

export function Rating({ orderId, ratedId, ratedUsername }: RatingProps) {
  const [rating, setRating] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (rating > 0) {
      try {
        await client.rateUser({
          rating: rating,
          userId: ratedId,
          orderId: orderId,
        });

        setIsSubmitted(true);
      } catch (error) {
        console.error("Error while rating:", error);
      }
    }
  };

  return isSubmitted ? (
    <div className="flex justify-center items-center space-x-1 border border-secondary border-opacity-10 w-full bg-terciary bg-opacity-10 rounded-md mt-2">
      <span className="text-xs font-bold pr-1 text-terciary">
        {t("thanks")}
      </span>
    </div>
  ) : (
    <div className="flex justify-center items-center space-x-0.5 w-full rounded-md mt-2">
      <div className="flex items-center">
        <span className="text-sm text-primary pr-2">
          {t("rate_user") + " " + ratedUsername + ": "}
        </span>
      </div>
      <div className="flex items-center space-x-1 rounded-md bg-white p-0.5 border border-terciary border-opacity-20">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 cursor-pointer ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-primary text-opacity-60"
            }`}
            onClick={() => setRating(star)}
          />
        ))}
        <Button
          size="icon"
          className="h-6 w-6 ml-1 bg-terciary text-white border border-gray-300 rounded-md"
          onClick={handleSubmit}
          disabled={rating === 0}
          aria-label="Submit rating"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
