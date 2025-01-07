"use client";

import { useState } from "react";
import { Star, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { p2pMarketAPIClient as client } from "../../lib/APIClients";
import { useUserContext } from "./UserContext";
import { useTranslation } from "react-i18next";

interface RatingProps {
  orderId: string;
  ratedId: string;
  onSubmit?: (rating: number) => void;
}

export function Rating({ orderId, ratedId }: RatingProps) {
  const [rating, setRating] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user, isLoggedIn } = useUserContext();
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (rating > 0) {
      try {
        await client.rateUser({
          rating: rating,
          userId: ratedId,
          orderId: orderId,
        });
        console.log(`Submitted rating: ${rating}`);
        setIsSubmitted(true);
      } catch (error) {
        console.error("Error while rating:", error);
      }
    }
  };

  return (
    <div>
      {isSubmitted ? (
        <span className="text-primary py-1">{t("thanks")}</span>
      ) : (
        <Card>
          <CardContent className="flex px-0 py-0 items-center rounded-md">
            <span className="text-xs font-bold pr-2">
              {t("rate_user") + ": "}
            </span>
            <div className="flex items-center space-x-1 rounded-md">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 cursor-pointer ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <Button
              size="icon"
              className="h-6 w-6 ml-1 bg-terciary text-white border border-gray-300 rounded-md"
              onClick={handleSubmit}
              disabled={rating === 0}
              aria-label="Submit rating"
            >
              <Check className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
