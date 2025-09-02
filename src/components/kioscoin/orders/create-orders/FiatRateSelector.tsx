"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import SuggestedRateCard from "./SuggestedRateCard";

interface Props {
  fiatCode: "ARS" | "EUR";
  setFiatCode: (value: "ARS" | "EUR") => void;
  tokenCode: string;
  suggestedRate: number | null;
  customRate: number | null;
  isLoadingRate: boolean;
  rateError: string | null;
  onCustomRateChange: (value: number | null) => void;
}

const fiatEmojiMap: Record<"ARS" | "EUR", string> = {
  ARS: "🇦🇷",
  EUR: "🇪🇺",
};

export default function FiatRateSelector({
  fiatCode,
  setFiatCode,
  tokenCode,
  suggestedRate,
  customRate,
  isLoadingRate,
  rateError,
  onCustomRateChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-start gap-4 font-secondary">
      {/* Selector + input en columna */}
      <div className="flex flex-col gap-2 flex-1">
        {/* Selector de moneda fiat */}
        <div className="space-y-1">
          <Label className="text-base font-bold text-primary mb-1">
            {t("i_want_to_receive_in")}
          </Label>
          <div className="flex gap-2">
            {(["ARS", "EUR"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setFiatCode(code)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-medium transition",
                  fiatCode === code
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-gray-300 text-muted-foreground"
                )}
              >
                <span className="text-lg">{fiatEmojiMap[code]}</span>
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Input de rate personalizado */}
        <div className="space-y-1">
          <Label className="text-sm font-medium">
            {t("custom_rate") || "Tipo de cambio personalizado"}
          </Label>
          <Input
            id="custom-rate"
            type="number"
            min="0"
            step="0.01"
            value={customRate ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                onCustomRateChange(null);
                return;
              }

              const numValue = parseFloat(value);
              if (!isNaN(numValue) && numValue >= 0) {
                const roundedValue = Math.round(numValue * 100) / 100;
                onCustomRateChange(roundedValue);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "e" || e.key === "-") {
                e.preventDefault();
              }
            }}
            className={cn(
              "w-full mt-1 focus:ring-primary focus:border-primary",
              customRate === null && "border-red-500"
            )}
            placeholder={t("enter_amount")}
          />

          {(customRate === null || rateError) && (
            <span className="text-xs text-primary mt-1 block">
              {rateError || t("rate_must_be_positive")}
            </span>
          )}
        </div>
      </div>

      {/* Rate sugerido a la derecha */}
      {/* <SuggestedRateCard
        suggestedRate={suggestedRate}
        tokenCode={tokenCode}
        fiatCode={fiatCode}
      /> */}
    </div>
  );
}
