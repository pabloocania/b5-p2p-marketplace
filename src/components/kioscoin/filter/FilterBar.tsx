"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import { FilterBarProps, FilterGroupType, FilterState } from "./types";
import { scrollbarHideClass } from "./constants";
import FilterGroup from "./FilterGroup";

export default function FilterBar({
  filters,
  setFilters,
  filterGroups,
  showSearch = true,
  className = "",
}: FilterBarProps) {
  const [activeGroup, setActiveGroup] = useState<FilterGroupType | null>(null);
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

  return (
    <div className={`${className}`}>
      <style jsx global>
        {scrollbarHideClass}
      </style>

      {/* Main Filter Bar - Responsive Grid */}
      <div className="mb-1 font-secondary">
        <div className="bg-primary/10 font-secondary px-1 py-1 rounded-lg font-primary border border-primary/50">
          {/* Responsive Grid Layout - More Compact */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1">
            {defaultFilterGroups.map((group) => (
              <FilterGroup
                key={group.type}
                group={group}
                filters={filters}
                setFilters={setFilters}
                activeGroup={activeGroup}
                setActiveGroup={setActiveGroup}
                renderMode="badge"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Subgroup filters */}
      {activeGroup && activeGroup !== FilterGroupType.ORDER_TYPE && (
        <div className="bg-primary/10 font-secondary px-1 py-1 rounded-lg font-primary border border-primary/50">
          <FilterGroup
            group={
              defaultFilterGroups.find((group) => group.type === activeGroup) ||
              defaultFilterGroups[0]
            }
            filters={filters}
            setFilters={setFilters}
            activeGroup={activeGroup}
            setActiveGroup={setActiveGroup}
            renderMode="content"
          />
        </div>
      )}
    </div>
  );
}
