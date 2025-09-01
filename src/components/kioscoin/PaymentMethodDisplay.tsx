import { PaymentMethod } from "b5-api-client/dist/types";
import { useTranslation } from "react-i18next";
import { Tally1, Landmark, LucideIcon, WalletMinimal } from "lucide-react";

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

// Add size configuration mapping
const sizeMap: Readonly<Record<string, { icon: string; text: string }>> = {
  md: { icon: "w-1.5 h-1.5", text: "text-[10px]" },
  lg: { icon: "w-2 h-2", text: "text-[10px]" },
} as const;

interface EntityBadgeProps {
  readonly entity: string;
  readonly type: string;
  readonly alias?: string;
  readonly size?: keyof typeof sizeMap;
}

export const EntityBadge: React.FC<EntityBadgeProps> = ({
  entity,
  type,
  alias,
  size = "md", // default to md size
}) => {
  const IconComponent = paymentMethodIconMap[type] ?? Tally1;
  const sizeClass = sizeMap[size];

  return (
    <div className="inline-flex items-center space-x-0.5 px-0.5 py-0.5 rounded-md bg-secondary/20 text-primary/80">
      <IconComponent
        className={`${sizeClass.icon} ${
          paymentMethodColorMap[type] ?? entityColorMap.default
        }`}
      />
      <span className={sizeClass.text}>{entity}</span>
      {alias && <span className={sizeClass.text + " font-bold"}>{alias}</span>}
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
