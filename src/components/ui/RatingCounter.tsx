import React from "react";
import { Star, Check } from "lucide-react";

interface StarRatingProps {
  rating: number;
  transactionCount: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, transactionCount }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1 text-yellow-500 text-m bg-[#58bf4b] bg-opacity-15  rounded-full px-2 py-1">
        <span className="text-[13px] font-semibold">{rating}</span>
        <Star className="w-2 h-2" style={{ fill: "currentColor" }} />
      </div>
      <div className="flex items-center space-x-1 text-green-500 text-[13px] font-medium bg-[#58bf4b] bg-opacity-15 rounded-full px-2 py-1 font-semibold">
        <span>{transactionCount}</span>
        <Check className="w-3 h-3" />
      </div>
    </div>
  );
};