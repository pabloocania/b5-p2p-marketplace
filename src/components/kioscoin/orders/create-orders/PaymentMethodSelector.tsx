"use client";
import { Label } from "@/components/ui/label";
import CompactPaymentMethodSelector from "./CompactPaymentMethodSelector";
import { PaymentMethod } from "b5-api-client";

interface Props {
  selectedMethods: PaymentMethod[];
  onChange: (updatedMethods: PaymentMethod[]) => void;
  methods?: PaymentMethod[];
}

export default function PaymentMethodSelector({
  selectedMethods = [],
  onChange,
  methods = [],
}: Props) {
  const handleToggle = (method: PaymentMethod) => {
    const updated = selectedMethods.some((m) => m.entity === method.entity)
      ? selectedMethods.filter((m) => m.entity !== method.entity)
      : [...selectedMethods, method];

    onChange(updated);
  };

  const handleUpdateMethod = (updatedMethod: PaymentMethod) => {
    const updated = selectedMethods.map((method) =>
      method.entity === updatedMethod.entity ? { ...updatedMethod } : method
    );

    onChange(updated);
  };

  return (
    <>
      <CompactPaymentMethodSelector
        methods={methods.map((m) => ({ ...m, display: "alias" } as any))}
        selectedMethods={selectedMethods}
        onToggle={handleToggle}
        onUpdateMethod={handleUpdateMethod}
      />
    </>
  );
}
