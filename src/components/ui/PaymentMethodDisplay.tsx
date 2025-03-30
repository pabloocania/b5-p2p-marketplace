import { PaymentMethod } from "b5-api-client/dist/types";
import { useTranslation } from "react-i18next";
import {
  Tally1,
  Handshake,
  Landmark,
  LucideIcon,
  WalletMinimal,
} from "lucide-react";

interface PaymentMethodDisplayProps {
  method: PaymentMethod;
}

// Add color mapping for different entities
const entityColorMap: Readonly<Record<string, string>> = {
  "Mercado Pago": "text-blue-500",
  PayPal: "text-indigo-500",
  Stripe: "text-purple-500",
  Fintech: "text-green-500",
  "Bank transfer": "text-orange-500",
  // Default color for unknown entities
  default: "text-primary",
};

const paymentMethodColorMap: Readonly<Record<string, string>> = {
  FINTECH: "text-green-500",
  BANK: "text-orange-500",
} as const;

const paymentMethodIconMap: Readonly<Record<string, LucideIcon>> = {
  FINTECH: WalletMinimal,
  BANK: Landmark,
} as const;

interface EntityBadgeProps {
  readonly entity: string;
  readonly type: string;
}

const EntityBadge: React.FC<EntityBadgeProps> = ({ entity, type }) => {
  const IconComponent = paymentMethodIconMap[type] ?? Tally1;

  return (
    <div className="inline-flex items-center space-x-1 px-1 py-0.5 rounded-md bg-secondary/30 text-primary">
      <IconComponent
        className={`w-3 h-3 ${
          paymentMethodColorMap[type] ?? entityColorMap.default
        }`}
      />
      <span className="text-xs">{entity}</span>
    </div>
  );
};

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
    <div className="flex flex-wrap my-1">
      {allEntities.map((description, index) => (
        <EntityBadge key={index} entity={description} type={method.type} />
      ))}
    </div>
  );
};

export default PaymentMethodDisplay;
