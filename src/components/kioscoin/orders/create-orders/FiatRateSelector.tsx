"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslation } from "react-i18next";

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
    <>
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <Label className="font-bold text-base mb-1">
            {t("i_want_to_receive_in")}
          </Label>
          <RadioGroup
            value={fiatCode}
            onValueChange={setFiatCode}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="ars" value="ARS" />
              <Label htmlFor="ars">ARS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="eur" value="EUR" />
              <Label htmlFor="eur">EUR</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="bg-secondary/10 p-2 rounded-md">
          <Label className="text-xs font-semibold">{t("suggested_rate")}</Label>
          <div className="text-sm font-medium">
            1 {tokenCode} = {fiatCode === "EUR" ? "€" : "$"}{" "}
            {suggestedRate !== null
              ? suggestedRate.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "Loading..."}
          </div>
        </div>
      </div>

      <div className="space-y-1">
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
          className={`mt-1 focus:ring-primary focus:border-primary ${
            customRate === null ? "border-red-500" : ""
          }`}
          placeholder={t("enter_amount")}
        />

        {(customRate === null || rateError) && (
          <span className="text-xs text-primary mt-1 block">
            {rateError || t("rate_must_be_positive")}
          </span>
        )}
      </div>
    </>
  );
}
