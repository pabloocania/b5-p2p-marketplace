"use client";
import { useState } from "react";
import {
  BanknoteIcon,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Check,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaymentMethod } from "b5-api-client";
import { useTranslation } from "react-i18next";

interface ExtendedPaymentMethod extends PaymentMethod {
  display: string;
}

const defaultPaymentMethod: ExtendedPaymentMethod = {
  type: "FINTECH",
  entity: "Mercado Pago",
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
  const [aliasValues, setAliasValues] = useState<Record<string, string>>({});
  const savedMethods = selectedMethods.map((m) => ({ ...m }));

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
        return "bg-primary/10";
      case "FINTECH":
        return "bg-primary/10";
      default:
        return "bg-primary/10";
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
      setAliasValues((prev) => ({
        ...prev,
        [editingMethod.entity ?? ""]: e.target.value,
      }));
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

  const renderInputField = (method: ExtendedPaymentMethod) => {
    const isFintech = method.type === "FINTECH";
    const isIBAN = method.display === "IBAN";
    const fieldName = isFintech ? "alias" : isIBAN ? "cbu" : "alias";
    const placeholder =
      aliasValues[method.entity ?? ""] ||
      (isFintech
        ? editingMethod?.display || "alias"
        : isIBAN
        ? "IBAN"
        : "alias");
    const value = editingMethod
      ? isFintech
        ? editingMethod.alias
        : isIBAN
        ? editingMethod.cbu
        : editingMethod.alias
      : aliasValues[method.entity ?? ""] || "";
    console.log("placeholder", placeholder);
    return (
      <Input
        type="text"
        name={fieldName}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        className="text-sm h-8 font-montserrat-force"
        style={{ fontFamily: "Montserrat, sans-serif !important" }}
      />
    );
  };

  const handleMethodClick = (
    e: React.MouseEvent,
    method: ExtendedPaymentMethod
  ) => {
    console.log("method", method);
    e.preventDefault();
    const isSelected = selectedMethods.some((m) => m.entity === method.entity);
    onChange(
      isSelected
        ? selectedMethods.filter((m) => m.entity !== method.entity)
        : [...selectedMethods, method]
    );
    if (!readOnly) {
      if (isSelected) {
        console.log("isSelected", isSelected);
        setEditingMethod(null);
      } else {
        console.log("method", method);
        const existingMethod = methods.find((m) => m.entity === method.entity);
        console.log("existingMethod", existingMethod);
        setEditingMethod(
          existingMethod
            ? { ...existingMethod, display: method.display }
            : method
        );
      }
    }
  };

  const getAlias = (method: PaymentMethod) => {
    console.log("method*", method);
    console.log("selectedMethods*", selectedMethods);
    const existingMethod = selectedMethods.find(
      (m) => m.entity === method.entity
    );
    return existingMethod?.alias || "alias";
  };

  return (
    <Card className="w-full">
      <CardContent className="py-3">
        <div className="flex items-center mb-2">
          <h3
            className="text-xs font-secondary !text-gray-800 flex items-center gap-2"
            style={{ fontFamily: "Montserrat, sans-serif !important" }}
          >
            <CreditCard className="h-4 w-4" />
            {t("payment_methods")}
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
                          : "border border-gray-300"
                      }
                      transition-all duration-200
                    `}
                    onClick={(e) =>
                      handleMethodClick(e, {
                        ...method,
                        display: method.alias || "alias",
                      })
                    }
                  >
                    {getIcon(method.type)}
                    <span
                      className="font-medium text-xs text-primary font-montserrat-force"
                      style={{
                        fontFamily: "Montserrat, sans-serif !important",
                      }}
                    >
                      {method.entity}
                    </span>
                    <span
                      className="ml-auto text-xs !text-gray-600 font-medium font-montserrat-force"
                      style={{
                        fontFamily: "Montserrat, sans-serif !important",
                      }}
                    >
                      {getAlias(method)}
                    </span>
                    {/* {!readOnly &&
                      selectedMethods.some((m) => m.entity === method.entity) &&
                      renderMethodValue({ ...method, display: "alias" }) && (
                        <span className="ml-auto text-xs text-primary text-opacity-70">
                          {renderMethodValue({ ...method, display: "alias" })}
                        </span>
                      )} */}
                  </button>
                  {!readOnly && editingMethod?.entity === method.entity && (
                    <div className="flex gap-2 px-1 w-full">
                      <div
                        style={{
                          borderLeft: "2px",
                          paddingLeft: "1rem",
                        }}
                        className="w-full"
                      >
                        {renderInputField({ ...method, display: "alias" })}
                      </div>
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0 bg-primary text-white font-secondary"
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
            <p className="text-xs text-primary text-opacity-70 font-secondary">
              {t("no_payment_methods_available")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
