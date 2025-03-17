import { PaymentMethod } from "b5-api-client/dist/types";
import { useTranslation } from "react-i18next";
import { Tally1 }  from "lucide-react";


interface PaymentMethodDisplayProps {
  method: PaymentMethod;
}

const PaymentMethodDisplay: React.FC<PaymentMethodDisplayProps> = ({
  method,
}) => {
  const { t } = useTranslation();
  const paymentMethodMap: { [key: string]: string } = {
    MERCADO_PAGO: "Fintech",
    FINTECH: "Fintech",
    BANK: "Bank transfer",
  };

  const mapEntity = (entity: string | null): string => {
    const entityMap: { [key: string]: string } = {
      MERCADO_PAGO: "Mercado Pago",
      PAYPAL: "PayPal",
      STRIPE: "Stripe",
      // Add more entity mappings here
    };

    return entity ? entityMap[entity] ?? entity : ""; // Return empty string if entity is null or not found
  };

  const formatAlias = (alias: string): string => {
    return alias.startsWith("@") ? alias : `@${alias}`;
  };

  const methodDescription = paymentMethodMap[method.type] ?? "Unknown Method";
  const entityDescription =
    mapEntity(method.entity ?? null) || methodDescription; // Default to methodDescription if entityDescription is empty
  const formattedAlias = method.alias ? formatAlias(method.alias) : "";
  return (
    <div className="text-primary flex flex-row">
      {< Tally1 className="text-secondary"/>} <strong> {entityDescription} </strong>
    </div>
  );
};

export default PaymentMethodDisplay;
