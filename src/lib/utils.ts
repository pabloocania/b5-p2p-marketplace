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