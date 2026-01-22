import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatFiatAmount = (
  amount: string | undefined,
  fiatCode: string | undefined
) => {
  if (!amount) return "0,00";

  const numAmount = parseFloat(amount);
  const currencySymbol = fiatCode === "EUR" ? "€" : "$";
  const currencyCode = fiatCode === "ARS" ? "ARS" : "";

  const formattedNumber = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);

  // Agregar el símbolo de moneda al inicio
  return `${currencySymbol}${currencyCode} ${formattedNumber}`;
};

/**
 * Formats fiat amount for clipboard copy (e.g., "1000,00")
 * Uses comma as decimal separator, no thousands separator, no currency symbol
 */
export const formatFiatAmountForCopy = (amount: string | undefined): string => {
  if (!amount) return "0,00";
  const numAmount = parseFloat(amount);
  return numAmount.toFixed(2).replace(".", ",");
};

/**
 * Formats a token balance for display
 * @param balance - The raw balance string (in smallest unit, e.g., wei)
 * @param decimals - Number of decimals for the token
 * @param displayDecimals - Number of decimal places to show (default: 2)
 * @returns Formatted balance string
 */
export const formatTokenBalance = (
  balance: string,
  decimals: number,
  displayDecimals: number = 2
): string => {
  try {
    const balanceNumber = parseFloat(balance);
    const formattedBalance = balanceNumber / Math.pow(10, decimals);
    return formattedBalance.toFixed(displayDecimals);
  } catch {
    return "0.00";
  }
};

/**
 * Formats a token amount based on its decimals
 * @param amount - The amount in wei/smallest unit
 * @param decimals - Number of decimals for the token
 * @returns Formatted amount string
 */
export const formatTokenAmount = (amount: string, decimals: number): string => {
  if (!amount) return "0";

  try {
    // Convert to BigInt to handle large numbers
    const amountBigInt = BigInt(amount);
    const divisor = BigInt("1" + "0".repeat(decimals));

    // Split into whole and decimal parts
    const whole = amountBigInt / divisor;
    const remainder = amountBigInt % divisor;

    // Format decimal part with proper padding
    const decimalStr = remainder.toString().padStart(decimals, "0");

    // Remove trailing zeros from decimal part
    const trimmedDecimal = decimalStr.replace(/0+$/, "");

    // If no decimal part, return whole number
    if (trimmedDecimal === "") {
      return whole.toString();
    }

    // Format with proper decimal places
    return `${whole}.${trimmedDecimal}`;
  } catch (error) {
    // If conversion to BigInt fails, return "0"
    console.warn("Invalid amount format:", amount);
    return "0";
  }
};

/**
 * Converts a decimal amount to BigInt based on token decimals
 * @param amount - The decimal amount (e.g. "1.5")
 * @param decimals - Number of decimals for the token
 * @returns BigInt representation of the amount
 */
export const parseAmountToBigInt = (amount: string, decimals: number): bigint => {
  if (!amount) return BigInt(0);

  try {
    // Split the amount into whole and decimal parts
    const [whole, decimal = ''] = amount.split('.');

    // Pad or trim decimal part to match token decimals
    const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals);

    // Combine whole and decimal parts
    const fullAmount = whole + paddedDecimal;

    return BigInt(fullAmount);
  } catch (error) {
    console.warn("Invalid amount format:", amount);
    return BigInt(0);
  }
};

/**
 * Maps event types to translation keys
 * Components should use the returned key with their translation function
 */
export const getEventTypeTranslationKey = (eventType: string): string => {
  switch (eventType) {
    case "LOCKED":
      return "order_locked";
    case "RELEASED":
      return "order_released";
    case "FIAT_SENT":
      return "fiat_transferred";
    case "TAKEN":
      return "order_taken_event";
    case "REFUNDED":
      return "order_refunded";
    case "CANCELED":
      return "order_canceled";
    case "DISPUTED":
      return "order_disputed";
    default:
      return eventType; // Return as-is if no translation key exists
  }
};
