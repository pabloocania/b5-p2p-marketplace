"use client";

import type React from "react";
import { useState } from "react";
import {
  BanknoteIcon,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaymentMethod } from "b5-api-client";
import { useTranslation } from "react-i18next";

// Extended version using interface extension
interface ExtendedPaymentMethod extends PaymentMethod {
  display: "alias" | "IBAN";
}

const acceptedPaymentMethods: ExtendedPaymentMethod[] = [
  { type: "BANK", entity: "Revolut", display: "alias", alias: "" },
  { type: "FINTECH", entity: "Mercado Pago", display: "alias", alias: "" },
];

interface CompactPaymentMethodSelectorProps {
  methods?: ExtendedPaymentMethod[];
  selectedMethods: PaymentMethod[];
  onToggle: (method: ExtendedPaymentMethod) => void;
  onUpdateMethod: (updatedMethod: ExtendedPaymentMethod) => void;
  readOnly?: boolean;
}

const CompactPaymentMethodSelector: React.FC<
  CompactPaymentMethodSelectorProps
> = ({
  methods = acceptedPaymentMethods,
  selectedMethods,
  onToggle,
  onUpdateMethod,
  readOnly = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [editingMethod, setEditingMethod] =
    useState<ExtendedPaymentMethod | null>(null);

  const { t } = useTranslation();

  const getIcon = (type: string) => {
    switch (type) {
      case "BANK":
        return <BanknoteIcon className="h-4 w-4" />;
      case "FINTECH":
        return <CreditCard className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "BANK":
        return "bg-primary bg-opacity-5";
      case "FINTECH":
        return "bg-secondary bg-opacity-5";
      default:
        return "bg-muted";
    }
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingMethod) {
      const updatedMethod: ExtendedPaymentMethod = {
        ...editingMethod,
        [e.target.name]: e.target.value,
      };
      setEditingMethod(updatedMethod);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingMethod) {
      onUpdateMethod(editingMethod);
      setEditingMethod(null);
    }
  };

  const renderMethodValue = (method: ExtendedPaymentMethod) => {
    const selectedMethod = selectedMethods.find(
      (m) => m.entity === method.entity
    );
    const methodToRender = selectedMethod || method;

    if (methodToRender.type === "FINTECH") {
      return methodToRender.alias ? `${methodToRender.alias}` : "";
    }
    return methodToRender.cbu && methodToRender.type === "BANK"
      ? methodToRender.cbu
      : methodToRender.alias;
  };

  const renderInputField = (method: ExtendedPaymentMethod) => {
    const isFintech = method.type === "FINTECH";
    const isIBAN = method.display === "IBAN";
    const fieldName = isFintech ? "alias" : isIBAN ? "cbu" : "alias";
    const placeholder = isFintech ? "alias" : isIBAN ? "IBAN" : "alias";
    const value = editingMethod
      ? isFintech
        ? editingMethod.alias
        : isIBAN
        ? editingMethod.cbu
        : editingMethod.alias
      : "";

    return (
      <Input
        type="text"
        name={fieldName}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        className="text-sm h-8"
      />
    );
  };

  const handleMethodClick = (
    e: React.MouseEvent,
    method: ExtendedPaymentMethod
  ) => {
    e.preventDefault();
    onToggle(method);
    if (!readOnly) {
      if (selectedMethods.some((m) => m.entity === method.entity)) {
        setEditingMethod(null);
      } else {
        setEditingMethod(method);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-semibold text-primary">
            {t("payment_method")}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-transparent text-primary"
            onClick={toggleOpen}
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
            <div className="space-y-1.5">
              {methods.map((method) => (
                <div
                  key={`${method.type}-${method.entity}`}
                  className="space-y-1"
                >
                  <button
                    className={`w-full px-3 py-2 flex items-center gap-2 rounded-lg text-left
                      ${getColor(method.type)}
                      ${
                        selectedMethods.some((m) => m.entity === method.entity)
                          ? "border-2 border-terciary"
                          : ""
                      }
                      transition-all duration-200
                      hover:opacity-90
                    `}
                    onClick={(e) => handleMethodClick(e, method)}
                  >
                    {getIcon(method.type)}
                    <span className="font-medium text-sm text-primary">
                      {method.entity}
                    </span>
                    {!readOnly && renderMethodValue(method) && (
                      <span className="ml-auto text-xs text-primary text-opacity-70">
                        {renderMethodValue(method)}
                      </span>
                    )}
                  </button>
                  {!readOnly && editingMethod?.entity === method.entity && (
                    <div className="flex gap-2 px-1 w-full">
                      <div
                        style={{
                          borderLeft: "2px solid #ccc",
                          paddingLeft: "1rem",
                        }}
                        className="w-full"
                      >
                        {renderInputField(method)}
                      </div>
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0 bg-secondary text-white hover:bg-secondary/90"
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
            <p className="text-xs text-primary text-opacity-70">
              No payment methods available.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactPaymentMethodSelector;
