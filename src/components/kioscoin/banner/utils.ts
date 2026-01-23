import { BannerOffer } from "./types";
import { CreateOrderRequest } from "b5-api-client";

export const transformBannerOfferToOrderRequest = (
    offer: BannerOffer,
    userId?: string,
    username?: string
): CreateOrderRequest => {
    return {
        type: offer.type,
        description: offer.title,
        amount: offer.amount,
        tokenCode: offer.tokenCode,
        fiatAmount: offer.fiatAmount?.replace(/[^0-9.]/g, ""), // Remove currency symbols
        fiatCode: offer.fiatCode,
        paymentMethods: offer.exchangeMethods,
        status: "PENDING",
        creatorId: userId,
        creatorUsername: username
    };
}; 
