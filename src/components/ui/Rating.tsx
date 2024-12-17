"use client";

import { useState } from "react";
import { Star, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { p2pMarketAPIClient as client } from "../../lib/APIClients";
import { useUserContext } from "./UserContext";

interface RatingProps {
  orderId: string;
  ratedId: string;
  onSubmit?: (rating: number) => void;
}

export function Rating({ orderId, ratedId }: RatingProps) {
  const [rating, setRating] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user, isLoggedIn } = useUserContext();

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
        console.error("Error notifying FIAT sent:", error);
      }
    }
  };

  return (
    <Card className="w-full max-w-[180px]">
      <CardContent className="p-2 border border-terciary flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 cursor-pointer ${
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
          className="h-8 w-8 ml-2 bg-terciary text-white"
          onClick={handleSubmit}
          disabled={rating === 0}
          aria-label="Submit rating"
        >
          <Check className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
