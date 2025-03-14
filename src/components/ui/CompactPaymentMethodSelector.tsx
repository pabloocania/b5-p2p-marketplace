"use client";

import type React from "react";
import { MouseEventHandler, useState } from "react";
import {
  BanknoteIcon,
  CreditCard,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
  HandCoins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PaymentMethodType = "BANK" | "FINTECH" | "OTHER";

interface PaymentMethod {
  type: PaymentMethodType;
  alias: string;
  entity: string;
  userAlias?: string;
  accountNumber?: string;
}

interface CompactPaymentMethodSelectorProps {
  methods?: PaymentMethod[];
  selectedMethods: PaymentMethod[];
  onToggle: (method: PaymentMethod) => void;
  onUpdateMethod: (updatedMethod: PaymentMethod) => void;
}

const CompactPaymentMethodSelector: React.FC<
  CompactPaymentMethodSelectorProps
> = ({ methods = [], selectedMethods, onToggle, onUpdateMethod }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );

  const getIcon = (type: PaymentMethodType) => {
    switch (type) {
      case "BANK":
        return <BanknoteIcon className="h-4 w-4" />;
      case "FINTECH":
        return <CreditCard className="h-4 w-4" />;
      case "OTHER":
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const getColor = (type: PaymentMethodType) => {
    switch (type) {
      case "BANK":
        return "rgba(75, 117, 231, 0.6)"; // #2a386b con 50% de transparencia
      case "FINTECH":
        return "rgba(88, 191, 75, 0.6)"; // #58bf4b con 50% de transparencia
      case "OTHER":
        return "rgba(42, 56, 107, 0.6)"; // #4B75E7 con 50% de transparencia
    }
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingMethod) {
      const updatedMethod = {
        ...editingMethod,
        [e.target.name]: e.target.value,
      };
      console.log("Editando método de pago:", updatedMethod);
      setEditingMethod(updatedMethod);
    }
  };

  const handleSave = () => {
    if (editingMethod) {
      console.log("Método actualizado antes de enviar:", editingMethod);
      onUpdateMethod(editingMethod);
      setEditingMethod(null);
    }
  };

  const handleMethodClick = (e: React.MouseEvent, method: PaymentMethod) => {
    e.preventDefault();
    console.log("Método de pago clickeado:", method);
    onToggle(method);
    setEditingMethod(method);
  };

  return (
    <Card className="w-full shadow-sm bg-secondary bg-opacity-10 shadow-md">
      <CardContent className="items-center mt-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg py-3 font-semibold text-secondary">
            Métodos de Pago
          </h3>
          <HandCoins className="text-secondary" />
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-transparent border shadow-md"
            onClick={(e) => toggleOpen(e)}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[1000px]" : "max-h-0"
          }`}
        >
          {methods.length > 0 ? (
            <div className="space-y-1.5 m-3">
              {methods.map((method) => (
                <div key={method.alias} className="space-y-1">
                  <button
                    className={`w-full p-2 flex items-center gap-2 shadow-md rounded-lg text-left text-white
                        ${
                          selectedMethods.some((m) => m.alias === method.alias)
                            ? "border-2"
                            : "border border-transparent"
                        }
                      transition-all duration-200
                      hover:opacity-90
                    `}
                    style={{ backgroundColor: getColor(method.type) }}
                    onClick={(e) => handleMethodClick(e, method)}
                  >
                    {getIcon(method.type)}
                    <span className="font-medium text-sm">{method.alias}</span>
                    {(method.userAlias || method.accountNumber) && (
                      <span className="ml-auto text-xs text-gray-500">
                        {method.type === "FINTECH"
                          ? `@${method.userAlias}`
                          : method.accountNumber}
                      </span>
                    )}
                  </button>
                  {editingMethod?.alias === method.alias && (
                    <div className="flex items-center gap-2 px-3">
                      <Input
                        type="text"
                        name={
                          method.type === "FINTECH"
                            ? "userAlias"
                            : "accountNumber"
                        }
                        placeholder={
                          method.type === "FINTECH"
                            ? "@alias"
                            : "Account number"
                        }
                        value={
                          method.type === "FINTECH"
                            ? editingMethod.userAlias || ""
                            : editingMethod.accountNumber || ""
                        }
                        onChange={handleInputChange}
                        className="text-sm h-8"
                      />
                      <Button
                        size="md"
                        className="h-8 w-8 px-2 border shadow-lg bg-transparent"
                        onClick={handleSave}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              No payment methods available.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactPaymentMethodSelector;
