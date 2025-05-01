import { PaymentMethod } from "b5-api-client";
import { FiatAmountRange } from "./types";

// Data for filter options
export const allBlockchains = [
    "Arbitrum",
    "Ethereum",
    "BNB Chain",
    "Avalanche",
    "Polygon",
    "Optimism",
    "Base",
];

export const allTokenCodes = ["USDT", "USDC", "USDK"];

export const allFiatCodes = ["USD", "EUR", "ARS"];

export const allPaymentMethods: PaymentMethod[] = [
    { entity: "Mercado Pago", type: "MERCADO_PAGO" },
    { entity: "Lemon", type: "FINTECH" },
    { entity: "Revolut", type: "BANK" },
];

// Constants (ensure fiatAmountRanges uses the interface)
export const fiatAmountRanges: FiatAmountRange[] = [
    { label: "< 1,000", min: "0", max: "1000" },
    { label: "1,000 - 5,000", min: "1000", max: "5000" },
    { label: "5,000 - 10,000", min: "5000", max: "10000" },
    { label: "> 10,000", min: "10000", max: undefined },
];

// Add CSS utility for hiding scrollbars while maintaining scroll functionality
export const scrollbarHideClass = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`; 