"use client";

import { OrderOffer } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { CryptoAmountIcon } from "../../CryptoIcon";
import { getBlockchainDisplayName } from "@/lib/ConfigStore";

interface OperationOrderDetailsProps {
  readonly offer: OrderOffer;
  // i18n key for the main line, e.g. "you_must_pay" | "you_will_receive"
  readonly mainLineKey: string;
}

export function OperationOrderDetails({
  offer,
  mainLineKey,
}: OperationOrderDetailsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <Label
        htmlFor="orderDetails"
        className="font-secondary text-dark flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        {t("order_details")}
      </Label>
      <div className="rounded-lg px-5 py-4 bg-white border border-secondary/20 shadow-md">
        <div className="space-y-2">
          <p className="text-primary font-secondary">
            {t(mainLineKey)}{" "}
            <strong className="text-dark">
              {offer.fiatCode} {offer.fiatAmount}
            </strong>
          </p>
          <p className="text-primary font-secondary flex items-center gap-1">
            {t("for")}{" "}
            <CryptoAmountIcon
              formattedAmount={offer.tokenAmount}
              tokenCode={offer.tokenCode?.toLowerCase()!!}
              textSizeClass="text-md text-dark font-bold"
              amountTextClassName="font-bold"
              iconSize="sm"
            />
          </p>
          <p className="text-sm text-primary font-secondary flex items-center gap-1">
            {t("in")}:{" "}
            <strong className="text-dark">
              {getBlockchainDisplayName(offer.blockchain)}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OperationOrderDetails;
