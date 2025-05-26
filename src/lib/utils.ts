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

  const formattedNumber = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);

  // Agregar el símbolo de moneda al inicio
  return `${currencySymbol} ${formattedNumber}`;
};

// Format balances for display with smart number formatting
const formatBalance = (balance: string): string => {
  const value = parseFloat(balance);

  if (value === 0) return "0";
  if (value < 0.001 && value > 0) return "<0.001";

  // For very large numbers, use compact notation
  if (value >= 1000000) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }

  // For medium-large numbers, use fewer decimal places
  if (value >= 1000) {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  // For smaller numbers, show more precision
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 2,
  });
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
