"use client";
import { useState, useMemo } from "react";
import { PaymentMethod } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { ChevronDown, Landmark, WalletMinimal, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FiatReceiveMethodSelectorProps {
  readonly availableMethods: readonly PaymentMethod[];
  readonly userMethods: readonly PaymentMethod[];
  readonly selectedMethod: PaymentMethod | null;
  readonly onMethodSelect: (method: PaymentMethod) => void;
  readonly fiatCode: string;
  readonly disabled?: boolean;
}

// Color mappings aligned with PaymentMethodDisplay
const entityColorMap: Readonly<Record<string, string>> = {
  "Mercado Pago": "text-blue-500",
  PayPal: "text-indigo-500",
  Stripe: "text-purple-500",
  Ualá: "text-red-500",
  default: "text-green-500",
};

const paymentMethodColorMap: Readonly<Record<string, string>> = {
  FINTECH: "text-green-500",
  BANK: "text-orange-500",
} as const;

interface PaymentMethodIconProps {
  readonly type: string;
  readonly entity?: string;
  readonly size?: "sm" | "md";
}

const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({
  type,
  entity,
  size = "md",
}) => {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const containerSize = size === "sm" ? "w-6 h-6" : "w-8 h-8";

  const getIconColor = () => {
    if (type === "BANK") return paymentMethodColorMap.BANK;
    return entityColorMap[entity ?? ""] ?? paymentMethodColorMap.FINTECH;
  };

  const iconColor = getIconColor();
  const IconComponent = type === "BANK" ? Landmark : WalletMinimal;

  return (
    <div
      className={`${containerSize} rounded-md bg-secondary/50 flex items-center justify-center shrink-0`}
    >
      <IconComponent className={`${sizeClass} ${iconColor}`} />
    </div>
  );
};

interface MethodRowProps {
  readonly method: PaymentMethod;
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly showAlias?: boolean;
}

const MethodRow: React.FC<MethodRowProps> = ({
  method,
  isSelected,
  onClick,
  showAlias = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200
      ${
        isSelected
          ? "bg-secondary/80 border-2 border-primary"
          : "bg-secondary/40 border border-transparent hover:bg-secondary/60"
      }
    `}
  >
    <PaymentMethodIcon type={method.type} entity={method.entity} size="sm" />
    <div className="flex-1 text-left min-w-0">
      <span className="text-sm font-medium text-dark block truncate">
        {method.entity ?? method.type}
      </span>
      {showAlias && method.alias && (
        <span className="text-xs text-muted-foreground block truncate">
          {method.alias}
        </span>
      )}
    </div>
    {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
  </button>
);

interface AliasInputSectionProps {
  readonly method: PaymentMethod;
  readonly alias: string;
  readonly onAliasChange: (alias: string) => void;
  readonly onConfirm: () => void;
}

const AliasInputSection: React.FC<AliasInputSectionProps> = ({
  method,
  alias,
  onAliasChange,
  onConfirm,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/30">
      <p className="text-xs text-dark mb-1 font-secondary">
        {t("enter_alias_for")}{" "}
        <span className="font-semibold">{method.entity}</span>
      </p>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={t("alias_placeholder")}
          value={alias}
          onChange={(e) => onAliasChange(e.target.value)}
          className="flex-1 h-9 text-sm bg-background font-secondary"
        />
        <Button
          onClick={onConfirm}
          disabled={!alias.trim()}
          className="h-9 px-3 bg-secondary text-white"
        >
          <Check className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default function FiatReceiveMethodSelector({
  availableMethods,
  userMethods,
  selectedMethod,
  onMethodSelect,
  fiatCode,
  disabled = false,
}: FiatReceiveMethodSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<PaymentMethod | null>(
    null
  );
  const [aliasInput, setAliasInput] = useState("");

  // Merge user methods with available methods - user methods take priority
  const methodsWithUserData = useMemo(() => {
    return availableMethods.map((availableMethod) => {
      const userMethod = userMethods.find(
        (um) =>
          um.entity === availableMethod.entity &&
          um.type === availableMethod.type
      );
      return userMethod ?? availableMethod;
    });
  }, [availableMethods, userMethods]);

  const handleMethodClick = (method: PaymentMethod) => {
    // If method has alias, select it directly
    if (method.alias && method.alias.trim()) {
      onMethodSelect(method);
      setIsOpen(false);
      setPendingMethod(null);
      setAliasInput("");
    } else {
      // Need to input alias
      setPendingMethod(method);
      setAliasInput("");
    }
  };

  const handleConfirmAlias = () => {
    if (pendingMethod && aliasInput.trim()) {
      const methodWithAlias: PaymentMethod = {
        ...pendingMethod,
        alias: aliasInput.trim(),
      };
      onMethodSelect(methodWithAlias);
      setIsOpen(false);
      setPendingMethod(null);
      setAliasInput("");
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setPendingMethod(null);
      setAliasInput("");
    }
  };

  // Only consider it a valid selection if the method has an alias
  const hasValidSelection =
    selectedMethod !== null &&
    selectedMethod.alias &&
    selectedMethod.alias.trim().length > 0;

  return (
    <div className="w-full font-secondary">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`
          w-full flex items-center px-3 py-2 rounded-lg
          bg-white transition-all duration-200 border border-secondary
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-secondary/70 cursor-pointer"
          }
        `}
      >
        <span className="text-xs text-primary font-secondary whitespace-nowrap">
          {t("receive_fiat_via", { fiatCode })}
        </span>
        <div className="flex-1 flex items-center justify-end gap-2">
          {hasValidSelection ? (
            <div className="text-right min-w-0">
              <span className="text-xs font-medium text-dark block truncate">
                {selectedMethod.entity}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {selectedMethod.alias}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              {t("select_method")}
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
        </div>
      </button>

      {/* Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md bg-background border-secondary font-secondary">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-dark font-secondary">
              {t("select_payment_method")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {methodsWithUserData.length > 0 ? (
              methodsWithUserData.map((method) => (
                <MethodRow
                  key={`${method.type}-${method.entity}`}
                  method={method}
                  isSelected={
                    selectedMethod?.entity === method.entity &&
                    selectedMethod?.type === method.type
                  }
                  onClick={() => handleMethodClick(method)}
                  showAlias={!!method.alias}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("no_payment_methods_available")}
              </p>
            )}
          </div>

          {/* Alias input section when a method without alias is selected */}
          {pendingMethod && (
            <AliasInputSection
              method={pendingMethod}
              alias={aliasInput}
              onAliasChange={setAliasInput}
              onConfirm={handleConfirmAlias}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
