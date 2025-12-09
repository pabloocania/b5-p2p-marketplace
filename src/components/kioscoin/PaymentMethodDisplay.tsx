import { PaymentMethod } from "b5-api-client/dist/types";
import { Tally1, Landmark, LucideIcon, WalletMinimal } from "lucide-react";

interface PaymentMethodDisplayProps {
  method: PaymentMethod;
  showAlias?: boolean;
  size?: keyof typeof sizeMap;
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
  FINTECH: "text-dark",
  BANK: "text-dark",
} as const;

const paymentMethodIconMap: Readonly<Record<string, LucideIcon>> = {
  FINTECH: WalletMinimal,
  BANK: Landmark,
} as const;

// Add size configuration mapping
const sizeMap: Readonly<Record<string, { icon: string; text: string }>> = {
  xs: { icon: "w-1 h-1", text: "text-xs" },
  md: { icon: "w-2 h-2", text: "text-md" },
  lg: { icon: "w-4 h-4", text: "text-lg" },
} as const;

interface EntityBadgeProps {
  readonly entity: string;
  readonly type: string;
  readonly alias?: string;
  readonly size?: keyof typeof sizeMap;
  readonly showAlias?: boolean;
}

export const EntityBadge: React.FC<EntityBadgeProps> = ({
  entity,
  type,
  alias,
  size = "md", // default to md size
  showAlias = false,
}) => {
  const IconComponent = paymentMethodIconMap[type] ?? Tally1;
  const sizeClass = sizeMap[size];
  return (
    <div className="inline-flex max-w-full flex-col items-start gap-0.5 px-1 py-1 rounded-md bg-secondary/30 text-dark text-left">
      <div className="flex items-center gap-1">
        <IconComponent
          className={`${sizeClass.icon} ${
            paymentMethodColorMap[type] ?? entityColorMap.default
          } shrink-0`}
        />
        {entity && (
          <span className={`${sizeClass.text} text-dark whitespace-normal`}>
            {entity}
          </span>
        )}
      </div>
      {showAlias && alias && (
        <span className={`${sizeClass.text} font-bold break-all text-dark`}>
          {alias}
        </span>
      )}
    </div>
  );
};

const PaymentMethodDisplay: React.FC<PaymentMethodDisplayProps> = ({
  method,
  showAlias = false,
  size = "md",
}) => {
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

  const entities = method.entity
    ? method.entity
        .split(",")
        .map((value) => mapEntity(value.trim()))
        .filter((value) => value.length > 0)
    : [methodDescription];

  const rawAlias = method.alias?.trim() ?? "";
  const formattedAlias =
    showAlias && rawAlias.length > 0 ? formatAlias(rawAlias) : undefined;

  return (
    <div className="flex flex-wrap gap-1 text-xs font-secondary mb-1">
      {entities.map((description, index) => (
        <EntityBadge
          key={`${description}-${index}`}
          entity={description}
          type={method.type ?? ""}
          alias={index === 0 ? formattedAlias : undefined}
          showAlias={showAlias}
          size={size}
        />
      ))}
    </div>
  );
};

export default PaymentMethodDisplay;
