import { PaymentMethod } from "b5-api-client";
import { FiatAmountRange } from "./types";
import { ConfigStore, BlockchainName } from "../../../lib/ConfigStore";

// Data for filter options
export const getBlockchains = async (): Promise<BlockchainName[]> => {
  const configStore = ConfigStore.getInstance();
  await configStore.waitForConfig();
  return configStore.getAllBlockchainNames();
};

export const getTokenCodes = async (): Promise<string[]> => {
  const configStore = ConfigStore.getInstance();
  await configStore.waitForConfig();
  const stablecoins = configStore.getBackendStablecoins()?.supportedStablecoins || [];
  return Array.from(new Set(stablecoins.map(stablecoin => stablecoin.name)));
};

// Default values in case config is not loaded yet
export const defaultBlockchains = ["Rootstock"];
export const defaultTokenCodes = ["USDK"];

// Export the functions to be used in components
export let allBlockchains: BlockchainName[] = defaultBlockchains;
export let allTokenCodes = defaultTokenCodes;

// Initialize the values
export const initializeFilterConstants = async () => {
  try {
    allBlockchains = await getBlockchains();
    allTokenCodes = await getTokenCodes();
  } catch (error) {
    console.error("Failed to initialize filter constants:", error);
  }
};

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
