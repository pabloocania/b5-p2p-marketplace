// SuggestedRateCard.tsx
"use client";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface Props {
  suggestedRate: number | null;
  tokenCode: string;
  fiatCode: "ARS" | "EUR";
}

export default function SuggestedRateCard({
  suggestedRate,
  tokenCode,
  fiatCode,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-secondary/10 p-2 rounded-md min-w-[160px] font-secondary">
      <Label className="text-xs font-semibold">{t("suggested_rate")}</Label>
      <div className="text-sm font-medium text-black">
        1 {tokenCode} = {fiatCode === "EUR" ? "€" : "$"}{" "}
        {suggestedRate !== null
          ? suggestedRate.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "Loading..."}
      </div>
    </div>
  );
}
