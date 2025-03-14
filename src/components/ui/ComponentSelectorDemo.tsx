import type React from "react";
import { useState } from "react";
import CompactPaymentMethodSelector from "./CompactPaymentMethodSelector";

type PaymentMethodType = "BANK" | "FINTECH" | "OTHER";

interface PaymentMethod {
  type: PaymentMethodType;
  alias: string;
  entity: string;
  userAlias?: string;
  accountNumber?: string;
}

const samplePaymentMethods: PaymentMethod[] = [
  { type: "BANK", alias: "Mi Banco", entity: "Big National Bank" },
  { type: "FINTECH", alias: "FinApp", entity: "FinTech Solutions Inc." },
  { type: "OTHER", alias: "PayPal", entity: "PayPal Holdings, Inc." },
  { type: "BANK", alias: "Cuenta Corriente", entity: "Community Credit Union" },
  { type: "FINTECH", alias: "Criptomonedas", entity: "CryptoSecure Ltd." },
];

interface PaymentMethodsDemoProps {
  selectedMethods: PaymentMethod[];
  setSelectedMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
}

const PaymentMethodsDemo: React.FC<PaymentMethodsDemoProps> = ({
  selectedMethods,
  setSelectedMethods,
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>(samplePaymentMethods);

  const handleToggle = (method: PaymentMethod) => {
    setSelectedMethods((prev) => {
      const newSelectedMethods = prev.some((m) => m.alias === method.alias)
        ? prev.filter((m) => m.alias !== method.alias)
        : [...prev, method];

      console.log("Selected methods after toggle:", newSelectedMethods);
      return newSelectedMethods;
    });
  };

  const handleUpdateMethod = (updatedMethod: PaymentMethod) => {
    setMethods((prev) =>
      prev.map((method) =>
        method.alias === updatedMethod.alias ? updatedMethod : method
      )
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <CompactPaymentMethodSelector
        methods={methods}
        selectedMethods={selectedMethods}
        onToggle={handleToggle}
        onUpdateMethod={handleUpdateMethod}
      />
    </div>
  );
};

export default PaymentMethodsDemo;
