import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderType, PaymentMethod } from "b5-api-client";
import { useTranslation } from "react-i18next";
import BadgeGroup from "./BadgeGroup";
import {
  FilterGroupConfig,
  FilterGroupType,
  FilterState,
  FiatAmountRange,
  FiatAmountRangeOptions,
} from "./types";
import {
  allBlockchains,
  allFiatCodes,
  allPaymentMethods,
  allTokenCodes,
  fiatAmountRanges,
} from "./constants";
import { getBlockchainDisplayName } from "@/lib/ConfigStore";

interface FilterGroupProps {
  group: FilterGroupConfig;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  activeGroup: FilterGroupType | null;
  setActiveGroup: React.Dispatch<React.SetStateAction<FilterGroupType | null>>;
  renderMode?: "badge" | "content";
}

export default function FilterGroup({
  group,
  filters,
  setFilters,
  activeGroup,
  setActiveGroup,
  renderMode = "badge",
}: FilterGroupProps) {
  const { t } = useTranslation();
  const orderTypes = ["BUY", "SELL"];

  // Specific handler for the 3-state Order Type toggle
  const handleOrderTypeToggle = () => {
    setFilters((prev) => {
      const currentOrderType = prev.orderType[0];
      let nextOrderType: OrderType[] = [];
      if (!currentOrderType) {
        nextOrderType = ["BUY" as OrderType]; // Off -> BUY
      } else if (currentOrderType === ("BUY" as OrderType)) {
        nextOrderType = ["SELL" as OrderType]; // BUY -> SELL
      } else {
        // currentOrderType === ("SELL" as OrderType)
        nextOrderType = []; // SELL -> Off
      }
      return { ...prev, orderType: nextOrderType };
    });
    // Ensure subgroup doesn't open for order type
    if (activeGroup === FilterGroupType.ORDER_TYPE) {
      setActiveGroup(null);
    }
  };

  const toggleStatus = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status as any)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status as any],
    }));
  };

  const toggleBlockchain = (blockchain: string) => {
    setFilters((prev) => ({
      ...prev,
      blockchain: prev.blockchain.includes(blockchain)
        ? prev.blockchain.filter((b) => b !== blockchain)
        : [...prev.blockchain, blockchain],
    }));
  };

  const toggleTokenCode = (tokenCode: string) => {
    setFilters((prev) => ({
      ...prev,
      tokenCode: prev.tokenCode.includes(tokenCode)
        ? prev.tokenCode.filter((t) => t !== tokenCode)
        : [...prev.tokenCode, tokenCode],
    }));
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    setFilters((prev) => {
      const isCurrentlySelected = prev.paymentMethods.some(
        (pm) => pm.entity === method.entity && pm.type === method.type
      );
      return {
        ...prev,
        paymentMethods: isCurrentlySelected
          ? prev.paymentMethods.filter(
              (pm) => pm.entity !== method.entity || pm.type !== method.type
            )
          : [...prev.paymentMethods, method],
      };
    });
  };

  const setFiatAmountRange = (
    min: string | undefined,
    max: string | undefined
  ) => {
    // If clicking the same range again, clear it
    if (
      filters.fiatAmountRange.min === min &&
      filters.fiatAmountRange.max === max
    ) {
      setFilters((prev) => ({
        ...prev,
        fiatAmountRange: { min: undefined, max: undefined },
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        fiatAmountRange: { min, max },
      }));
    }
  };

  const handleFiatCodeChange = (fiatCode: string) => {
    setFilters((prev) => ({
      ...prev,
      // If 'ALL' is selected, clear the filter, otherwise set the selected code
      fiatCode: fiatCode === t("all") ? [] : [fiatCode],
    }));
  };

  // Toggle active group
  const toggleActiveGroup = (groupType: FilterGroupType) => {
    setActiveGroup(activeGroup === groupType ? null : groupType);
  };

  // Get active filter count for a group
  const getActiveFilterCount = (group: FilterGroupConfig): number => {
    switch (group.type) {
      case FilterGroupType.ORDER_TYPE:
        return filters.orderType.length;
      case FilterGroupType.BLOCKCHAIN:
        return filters.blockchain.length;
      case FilterGroupType.TOKEN_CODE:
        return filters.tokenCode.length;
      case FilterGroupType.PAYMENT_METHODS:
        return filters.paymentMethods.length;
      case FilterGroupType.FIAT_AMOUNT_RANGE:
        return (
          filters.fiatCode.length +
          (filters.fiatAmountRange.min !== undefined ? 1 : 0)
        );
      default:
        return 0;
    }
  };

  // Render filter content based on group type
  const renderFilterContent = () => {
    switch (group.type) {
      case FilterGroupType.ORDER_TYPE:
        return (
          <BadgeGroup
            options={orderTypes}
            selectedItems={filters.orderType}
            onToggle={handleOrderTypeToggle}
            renderItemContent={(type) => t(type.toLowerCase())}
            getKey={(type) => type}
          />
        );

      case FilterGroupType.BLOCKCHAIN:
        return (
          <BadgeGroup
            options={group.options || allBlockchains}
            selectedItems={filters.blockchain}
            onToggle={toggleBlockchain}
            renderItemContent={(blockchain) =>
              getBlockchainDisplayName(blockchain)
            }
            getKey={(blockchain) => blockchain}
          />
        );

      case FilterGroupType.TOKEN_CODE:
        return (
          <BadgeGroup
            options={group.options || allTokenCodes}
            selectedItems={filters.tokenCode}
            onToggle={toggleTokenCode}
            renderItemContent={(token) => token}
            getKey={(token) => token}
          />
        );

      case FilterGroupType.PAYMENT_METHODS:
        const selectedPaymentMethods = filters.paymentMethods;
        return (
          <BadgeGroup<PaymentMethod>
            options={group.options || allPaymentMethods}
            selectedItems={selectedPaymentMethods}
            onToggle={togglePaymentMethod}
            renderItemContent={(method) =>
              method.entity?.replace("_", " ") || ""
            }
            getKey={(method) => `${method.type}-${method.entity}`}
            minWidthClass="min-w-[120px]"
          />
        );

      case FilterGroupType.FIAT_AMOUNT_RANGE:
        const fiatOptions = (group.options || {}) as FiatAmountRangeOptions;
        const currentFiatCodes = fiatOptions.fiatCodes || allFiatCodes;
        const currentRanges = fiatOptions.ranges || fiatAmountRanges;
        const selectedRangeArray: FiatAmountRange[] =
          filters.fiatAmountRange.min !== undefined
            ? [
                {
                  label: "",
                  min: filters.fiatAmountRange.min,
                  max: filters.fiatAmountRange.max,
                },
              ]
            : [];

        // Add 'ALL' option to fiat codes
        const fiatCodesWithAll = [t("all"), ...currentFiatCodes];

        // Determine the value for the Select component
        // If a specific code is selected, use it. Otherwise, show 'ALL'.
        const selectValue =
          filters.fiatCode.length > 0 ? filters.fiatCode[0] : t("all");

        // Define the Select component node
        const selectNode = (
          <Select
            value={selectValue} // <-- Use the determined value
            onValueChange={handleFiatCodeChange}
          >
            <SelectTrigger className="w-[90px] h-8">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent className="text-dark text-sm font-secondary">
              {/* Map over codes including 'ALL' */}
              {fiatCodesWithAll.map((code: string) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

        // Pass the Select node via leadingNodes
        return (
          <BadgeGroup<FiatAmountRange>
            leadingNodes={[selectNode]} // <-- Pass Select here
            options={currentRanges}
            selectedItems={selectedRangeArray}
            onToggle={(range: FiatAmountRange) =>
              setFiatAmountRange(range.min, range.max)
            }
            renderItemContent={(range) =>
              `${range.label} ${filters.fiatCode[0] || ""}`
            }
            getKey={(range) => `${range.min}-${range.max}`}
            minWidthClass="min-w-[120px]"
          />
        );

      default:
        return null;
    }
  };

  const activeCount = getActiveFilterCount(group);
  const isActive = activeGroup === group.type;

  // If rendering content mode, return the filter content
  if (renderMode === "content") {
    return renderFilterContent();
  }

  // --- Special handling for ORDER_TYPE badge ---
  if (group.type === FilterGroupType.ORDER_TYPE) {
    const currentOrderType = filters.orderType[0];
    const orderTypeIsActive = !!currentOrderType;
    const badgeText = orderTypeIsActive
      ? t(currentOrderType.toLowerCase())
      : group.title;

    return (
      <Badge
        key={group.type}
        className={`cursor-pointer capitalize flex items-center justify-center border text-xs border border-primary/50 ${
          orderTypeIsActive
            ? "bg-primary text-white" // Active style for BUY or SELL
            : "bg-white text-primary/70" // Inactive style (soft)
        }`}
        onClick={handleOrderTypeToggle} // <-- Use specific toggle handler
      >
        <span className="flex items-center font-bold text-sm antialiased tracking-tight">
          {badgeText}
          {activeCount > 0 && (
            <span className="ml-1 bg-primary text-white rounded-full w-3 h-3 text-xs flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </span>
      </Badge>
    );
  }

  // --- Default handling for other filter types ---
  return (
    <Badge
      key={group.type}
      className={`cursor-pointer capitalize flex items-center justify-center px-1 py-1 border border-primary/50 text-xs ${
        isActive ? "bg-primary text-white" : "bg-white text-primary/70"
      }`}
      onClick={() => toggleActiveGroup(group.type)}
    >
      <span className="flex items-center text-sm antialiased tracking-tight">
        {group.title}
        {activeCount > 0 && (
          <span className="ml-1 bg-primary text-white rounded-full w-3 h-3 text-xs flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </span>
    </Badge>
  );
}
