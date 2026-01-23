import { OrderType, PaymentMethod, OrderOffer } from "b5-api-client";

export interface BannerOffer {
    readonly id: string;
    readonly title: string;
    readonly action: string;
    readonly exchangeMethods: PaymentMethod[];
    readonly type: OrderType;
    readonly tokenCode: string;
    readonly blockchain: string;
    readonly amount: string;
    readonly fiatCode: "ARS" | "EUR";
    readonly fiatAmount?: string;
    readonly minFiatAmount?: string;
    readonly maxFiatAmount?: string;
    readonly description?: string;
    readonly price?: string;
    readonly crypto?: string;
}

export interface BannerOfferClickHandler {
    (offer: OrderOffer): void;
} 
