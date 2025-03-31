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
    return entity || ""; // Devuelve la entidad directamente si existe
  };

  // Descripción del método de pago
  const methodDescription = paymentMethodMap[method.type] ?? "Unknown Method";

  // Procesar las entidades
  let allEntities: string[] = [];

  if (Array.isArray(method.entity)) {
    // Si es un array, mapea directamente
    allEntities = method.entity.map((e) => mapEntity(e.trim()));
  } else if (typeof method.entity === "object" && method.entity !== null) {
    // Si es un objeto, convierte a array usando Object.values
    allEntities = Object.values(method.entity).map((e) => mapEntity(e.trim()));
  } else if (typeof method.entity === "string" && method.entity.trim() !== "") {
    // Si es una cadena no vacía, divide por comas
    allEntities = method.entity.split(",").map((e) => mapEntity(e.trim()));
  } else {
    // Si no hay entidades, usa la descripción del método
    allEntities = [methodDescription];
  }

  // Depuración de datos
  console.log("Method Entity:", method.entity);
  console.log("All Entities:", allEntities);

  return (
    <div className="grid grid-cols-2 gap-4 w-full min-w-[300px]">
      {allEntities?.map((description, index) => (
        <div key={index} className="flex items-center w-full">
          <Tally1 className="text-secondary flex-shrink-0" />
          <strong className="text-[11px] ml-2 truncate">{description}</strong>
        </div>
      ))}
    </div>
  );
};

export default PaymentMethodDisplay;
