"use client";
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

interface ExtendedPaymentMethod extends PaymentMethod {
  display: "alias" | "IBAN";
}

const defaultPaymentMethod: ExtendedPaymentMethod = {
  type: "BANK",
  entity: "",
  display: "alias",
  alias: "",
  cbu: "",
};

interface PaymentMethodSelectorProps {
  selectedMethods: PaymentMethod[];
  onChange: (updatedMethods: PaymentMethod[]) => void;
  methods?: PaymentMethod[];
  readOnly?: boolean;
}

export default function PaymentMethodSelector({
  selectedMethods = [],
  onChange,
  methods = [],
  readOnly = false,
}: PaymentMethodSelectorProps) {
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
      onChange(
        selectedMethods.map((method) =>
          method.entity === editingMethod.entity ? { ...editingMethod } : method
        )
      );
      setEditingMethod(null);
    }
  };

  const renderMethodValue = (method: ExtendedPaymentMethod) => {
    const selectedMethod = selectedMethods.find(
      (m) => m.entity === method.entity
    );
    const methodToRender = selectedMethod || method;

    if (!methodToRender) return "";

    if (readOnly) {
      return methodToRender.entity;
    }

    if (methodToRender.type === "FINTECH") {
      return methodToRender.alias || "";
    }
    return methodToRender.cbu || methodToRender.alias || "";
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
    onChange(
      selectedMethods.some((m) => m.entity === method.entity)
        ? selectedMethods.filter((m) => m.entity !== method.entity)
        : [...selectedMethods, method]
    );
    if (!readOnly) {
      if (selectedMethods.some((m) => m.entity === method.entity)) {
        setEditingMethod(null);
      } else {
        setEditingMethod(method);
      }
    }
  };

  return (
    <Card className="w-full font-secondary">
      <CardContent className="p-3">
        <div className="flex items-center mb-2">
          <h3 className="text-base font-semibold text-primary">
            {t("payment_method")}
          </h3>
        </div>
        <div>
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
                    onClick={(e) =>
                      handleMethodClick(e, { ...method, display: "alias" })
                    }
                  >
                    {getIcon(method.type)}
                    <span className="font-medium text-sm text-primary">
                      {method.entity}
                    </span>
                    {!readOnly &&
                      renderMethodValue({ ...method, display: "alias" }) && (
                        <span className="ml-auto text-xs text-primary text-opacity-70">
                          {renderMethodValue({ ...method, display: "alias" })}
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
                        {renderInputField({ ...method, display: "alias" })}
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
}
