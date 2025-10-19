"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  Filter as FilterIcon,
  X as CloseIcon,
} from "lucide-react";
import { FilterBarProps, FilterGroupType, FilterState } from "./types";
import { scrollbarHideClass, fiatAmountRanges } from "./constants";
import FilterGroup from "./FilterGroup";
import { Badge } from "@/components/ui/badge";
import { getBlockchainDisplayName } from "@/lib/ConfigStore";

export default function FilterBar({
  filters,
  setFilters,
  filterGroups,
  showSearch = true,
  className = "",
}: FilterBarProps) {
  const [activeGroup, setActiveGroup] = useState<FilterGroupType | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { t } = useTranslation();

  // Default filter groups if none are provided
  const defaultFilterGroups = [
    //   { type: FilterGroupType.SEARCH },
    { type: FilterGroupType.ORDER_TYPE, title: t("order_type") },
    { type: FilterGroupType.TOKEN_CODE, title: t("token") },
    { type: FilterGroupType.BLOCKCHAIN, title: t("blockchain") },
    { type: FilterGroupType.FIAT_AMOUNT_RANGE, title: t("amount_range") },
    { type: FilterGroupType.PAYMENT_METHODS, title: t("payment_methods") },
  ];

  // Centralized classes for styling (collapsed and expanded)
  const classes = {
    section: "mb-1 font-secondary",
    panel: "bg-secondary/20 shadow-sm font-secondary px-1 py-2 rounded-lg",
    grid: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1",
    collapsed: {
      row: "flex items-center gap-1",
      iconBox:
        "flex items-center justify-center w-8 h-8 rounded-md bg-white text-primary",
      badgesRow: "flex items-center gap-1 overflow-x-auto scrollbar-hide",
      label: "text-sm font-medium text-dark ml-1",
    },
    expanded: {
      header: "flex items-center justify-between",
      headerLeft: "flex items-center ml-2 gap-2 text-primary",
      closeBtn:
        "w-8 h-8 flex items-center justify-center rounded-md bg-white text-primary",
      grid: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 mt-1",
    },
  } as const;

  // Compute total active filters and compact summaries for the collapsed row
  const getActiveCountsByGroup = (f: FilterState) => ({
    [FilterGroupType.ORDER_TYPE]: f.orderType.length,
    [FilterGroupType.BLOCKCHAIN]: f.blockchain.length,
    [FilterGroupType.TOKEN_CODE]: f.tokenCode.length,
    [FilterGroupType.PAYMENT_METHODS]: f.paymentMethods.length,
    [FilterGroupType.FIAT_AMOUNT_RANGE]:
      (f.fiatCode.length > 0 ? 1 : 0) +
      (f.fiatAmountRange.min !== undefined ? 1 : 0),
  });

  const counts = getActiveCountsByGroup(filters);
  const totalActiveFilters = Object.values(counts).reduce((a, b) => a + b, 0);

  const collapsedBadges: React.ReactNode[] = [];
  // ORDER TYPE summary
  if (filters.orderType[0]) {
    collapsedBadges.push(
      <Badge
        key="order-type"
        className="bg-primary text-white text-xs border border-primary/50"
      >
        {t(filters.orderType[0].toLowerCase())}
      </Badge>
    );
  }
  // TOKEN CODE summary
  if (filters.tokenCode.length > 0) {
    collapsedBadges.push(
      <Badge
        key="token"
        className="bg-white text-primary/70 text-xs border border-primary/50"
      >
        {filters.tokenCode.join(", ")}
      </Badge>
    );
  }
  // BLOCKCHAIN summary
  if (filters.blockchain.length > 0) {
    collapsedBadges.push(
      <Badge
        key="blockchain"
        className="bg-white text-primary/70 text-xs border border-primary/50"
      >
        {filters.blockchain.map((b) => getBlockchainDisplayName(b)).join(", ")}
      </Badge>
    );
  }
  // PAYMENT METHODS summary
  if (filters.paymentMethods.length > 0) {
    collapsedBadges.push(
      <Badge
        key="pm"
        className="bg-white text-primary/70 text-xs border border-primary/50"
      >
        {`${filters.paymentMethods.length} ${t("payment_methods")}`}
      </Badge>
    );
  }
  // FIAT + RANGE summary
  if (
    filters.fiatCode.length > 0 ||
    filters.fiatAmountRange.min !== undefined
  ) {
    const match = fiatAmountRanges.find(
      (r) =>
        r.min === filters.fiatAmountRange.min &&
        r.max === filters.fiatAmountRange.max
    );
    const rangeLabel = match?.label || "";
    const code = filters.fiatCode[0] || "";
    const label = [rangeLabel, code].filter(Boolean).join(" ");
    if (label) {
      collapsedBadges.push(
        <Badge
          key="fiat"
          className="bg-white text-primary/70 text-xs border border-primary/50"
        >
          {label}
        </Badge>
      );
    }
  }

  const CollapsedRow = (
    <div className={classes.panel} onClick={() => setIsExpanded(true)}>
      <div className={classes.collapsed.row}>
        {totalActiveFilters === 0 ? (
          <>
            <div className={classes.collapsed.iconBox}>
              <FilterIcon size={16} />
            </div>
            <span className={classes.collapsed.label}>{t("filters")}</span>
          </>
        ) : (
          <div className={classes.collapsed.badgesRow}>{collapsedBadges}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`${className}`}>
      <style jsx global>
        {scrollbarHideClass}
      </style>

      {/* Collapsed row */}
      {!isExpanded && <div className={classes.section}>{CollapsedRow}</div>}

      {/* Expanded panel */}
      {isExpanded && (
        <>
          <div className={classes.section}>
            <div className={classes.panel}>
              <div className={classes.expanded.header}>
                <div className={classes.expanded.headerLeft}>
                  <FilterIcon size={16} />
                  <span className={classes.collapsed.label}>
                    {t("filters")}
                  </span>
                </div>
                <button
                  aria-label="collapse filters"
                  className={classes.expanded.closeBtn}
                  onClick={() => {
                    setActiveGroup(null);
                    setIsExpanded(false);
                  }}
                >
                  <CloseIcon size={16} />
                </button>
              </div>
              {/* Responsive Grid Layout - More Compact */}
              <div className={classes.expanded.grid}>
                {defaultFilterGroups.map((group) => (
                  <FilterGroup
                    key={group.type}
                    group={group}
                    filters={filters}
                    setFilters={setFilters}
                    activeGroup={activeGroup}
                    setActiveGroup={(g) => {
                      setIsExpanded(true);
                      setActiveGroup(g);
                    }}
                    renderMode="badge"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Subgroup filters */}
          {activeGroup && activeGroup !== FilterGroupType.ORDER_TYPE && (
            <div className={classes.panel}>
              <FilterGroup
                group={
                  defaultFilterGroups.find(
                    (group) => group.type === activeGroup
                  ) || defaultFilterGroups[0]
                }
                filters={filters}
                setFilters={setFilters}
                activeGroup={activeGroup}
                setActiveGroup={setActiveGroup}
                renderMode="content"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
