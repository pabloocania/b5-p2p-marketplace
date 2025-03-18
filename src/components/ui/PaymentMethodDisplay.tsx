import { PaymentMethod } from "b5-api-client/dist/types";
import { useTranslation } from "react-i18next";
import { Tally1 } from "lucide-react";

interface PaymentMethodDisplayProps {
  method: PaymentMethod;
}

const PaymentMethodDisplay: React.FC<PaymentMethodDisplayProps> = ({
  method,
}) => {
  const { t } = useTranslation();

  // Mapeo de tipos de métodos de pago
  const paymentMethodMap: { [key: string]: string } = {
    MERCADO_PAGO: "Fintech",
    FINTECH: "Fintech",
    BANK: "Bank transfer",
  };

  // Mapeo de entidades de pago
  const mapEntity = (entity: string | null): string => {
    const entityMap: { [key: string]: string } = {
      MERCADO_PAGO: "Mercado Pago",
      PAYPAL: "PayPal",
      STRIPE: "Stripe",
      // Puedes agregar más entidades aquí
    };

    return entity ? entityMap[entity] ?? entity : ""; // Retorna la entidad mapeada o la cadena original
  };

  // Formatea el alias de la cuenta
  const formatAlias = (alias: string): string => {
    return alias.startsWith("@") ? alias : `@${alias}`;
  };

  // Descripción del método de pago
  const methodDescription = paymentMethodMap[method.type] ?? "Unknown Method";

  const allEntities = method.entity
  ? method.entity.split(",").map((e) => mapEntity(e.trim()))
  : [methodDescription]; // Si no hay entidad, usa el tipo de método
  
  return (
    <div className="grid grid-cols-2 gap-4 w-full min-w-[200px]">
      {allEntities?.map((description, index) => (
        <div key={index} className="flex items-center">
          <Tally1 className="text-secondary" />
          <strong className="text-[11px] ml-2">{description}</strong>
        </div>
      ))}
    </div>
  );
};




export default PaymentMethodDisplay;
