"use client";
import { useEffect, useState } from "react";
import { PaymentMethod } from "b5-api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface PaymentMethodsComponentProps {
  methods: PaymentMethod[];
  selectedMethods: PaymentMethod[];
  onChange: (updated: PaymentMethod[]) => void;
  readOnly?: boolean;
}

export default function PaymentMethodsComponent({
  methods = [],
  selectedMethods = [],
  onChange,
  readOnly = false,
}: PaymentMethodsComponentProps) {
  const { t } = useTranslation();

  const [entityToAlias, setEntityToAlias] = useState<Record<string, string>>(
    {}
  );
  const [expandedEntities, setExpandedEntities] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const next: Record<string, string> = {};
    selectedMethods.forEach((m) => {
      if (m.entity) next[m.entity] = m.alias ?? "";
    });
    // Replace map to drop stale entries for unselected methods
    setEntityToAlias(next);
  }, [selectedMethods]);

  const isSelected = (method: PaymentMethod) =>
    selectedMethods.some((m) => m.entity === method.entity);

  const handleRowClick = (method: PaymentMethod) => {
    const entity = method.entity ?? "";
    if (!isSelected(method)) {
      const alias = entityToAlias[entity] ?? "";
      onChange([
        ...selectedMethods,
        {
          type: method.type,
          entity: method.entity,
          alias,
        } as PaymentMethod,
      ]);
      setExpandedEntities((prev) => ({ ...prev, [entity]: true }));
      return;
    }
    // Already selected: just toggle expansion
    setExpandedEntities((prev) => ({ ...prev, [entity]: !prev[entity] }));
  };

  const handleAliasChange = (entity: string, alias: string) => {
    setEntityToAlias((prev) => ({ ...prev, [entity]: alias }));
    const trimmed = alias.trim();
    if (trimmed.length === 0 && !readOnly) {
      // Do not persist empty alias to parent while editing
      return;
    }
    onChange(
      selectedMethods.map((m) =>
        m.entity === entity ? { ...m, alias: trimmed } : m
      )
    );
  };

  const handleAliasBlur = (entity: string) => {
    if (readOnly) return;
    const current = (entityToAlias[entity] ?? "").trim();
    if (current.length === 0) {
      // If left empty, unselect the method so there are no empty aliases in parent state
      onChange(selectedMethods.filter((m) => m.entity !== entity));
      return;
    }
    // Ensure parent has the latest non-empty value on blur
    onChange(
      selectedMethods.map((m) =>
        m.entity === entity ? { ...m, alias: current } : m
      )
    );
  };

  return (
    <Card className="w-full font-secondary border-none">
      <CardContent className="p-0">
        <div className="flex items-center mb-2">
          <h3 className="text-dark text-xs font-secondary">
            {t("payment_methods")}
          </h3>
        </div>

        {methods.length === 0 ? (
          <p className="text-xs text-dark">
            {t("no_payment_methods_available")}
          </p>
        ) : (
          <div className="space-y-1.5">
            {methods.map((method) => {
              const selected = isSelected(method);
              const selectedData = selectedMethods.find(
                (m) => m.entity === method.entity
              );
              return (
                <div
                  key={`${method.type}-${method.entity}`}
                  className="space-y-1"
                >
                  <button
                    type="button"
                    className={`w-full text-primary px-3 py-2 hover:bg-secondary/20 flex items-center gap-2 rounded-lg text-left border transition-all duration-200 ${
                      selected
                        ? "border border-secondary bg-secondary/10"
                        : "border-primary/80"
                    }`}
                    onClick={() => handleRowClick(method)}
                  >
                    <span className="font-medium text-xs">{method.entity}</span>
                    <span className="ml-auto text-xs text-dark">
                      {entityToAlias[method.entity ?? ""] ??
                        selectedData?.alias ??
                        ""}
                    </span>
                  </button>

                  {!readOnly &&
                    selected &&
                    expandedEntities[method.entity ?? ""] && (
                      <div className="flex gap-2 px-1 w-full">
                        <div className="w-full pl-2 border-l-2 border-secondary/40 rounded-xs">
                          <Input
                            type="text"
                            name="alias"
                            value={
                              entityToAlias[method.entity ?? ""] ??
                              selectedData?.alias ??
                              ""
                            }
                            placeholder={
                              (
                                entityToAlias[method.entity ?? ""] ?? ""
                              ).trim() ||
                              selectedData?.alias ||
                              ""
                            }
                            onChange={(e) =>
                              handleAliasChange(
                                method.entity ?? "",
                                e.target.value
                              )
                            }
                            onBlur={() => handleAliasBlur(method.entity ?? "")}
                            className="text-sm h-8 border border-primary/40"
                          />
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
