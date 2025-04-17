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
  const [isMainFilterScrollable, setIsMainFilterScrollable] = useState(false);
  const mainFilterRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Default filter groups if none are provided
  const defaultFilterGroups = [
    //   { type: FilterGroupType.SEARCH },
    { type: FilterGroupType.ORDER_TYPE, title: t("order_type") },
    { type: FilterGroupType.FIAT_AMOUNT_RANGE, title: t("amount_range") },
    { type: FilterGroupType.TOKEN_CODE, title: t("token") },
    { type: FilterGroupType.BLOCKCHAIN, title: t("blockchain") },
    { type: FilterGroupType.PAYMENT_METHODS, title: t("payment_methods") },
  ];

  // Check if main filter bar is scrollable
  useEffect(() => {
    const checkScrollability = () => {
      const element = mainFilterRef.current;
      if (element) {
        const hasOverflow = element.scrollWidth > element.clientWidth + 1;
        setIsMainFilterScrollable(hasOverflow);
      }
    };

    checkScrollability();
    window.addEventListener("resize", checkScrollability);

    const observer = new MutationObserver(checkScrollability);
    if (mainFilterRef.current) {
      observer.observe(mainFilterRef.current, { childList: true });
    }

    return () => {
      window.removeEventListener("resize", checkScrollability);
      observer.disconnect();
    };
  }, [defaultFilterGroups]);

  return (
    <div className={`${className}`}>
      <style jsx global>
        {scrollbarHideClass}
      </style>
      <div className="mb-2">
        <div className="flex items-center space-x-2 bg-secondary bg-opacity-40 px-2 py-2 rounded-md">
          <div className="relative flex-grow min-w-0">
            <div
              ref={mainFilterRef}
              className="flex overflow-x-auto gap-2 scrollbar-hide whitespace-nowrap"
            >
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
            {/* Fade effect (absolute inside relative parent) */}
            <div
              className={`absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-secondary/10 via-secondary/5 to-transparent pointer-events-none rounded-r-md transition-opacity duration-300 ${
                isMainFilterScrollable ? "opacity-100" : "opacity-0"
              }`}
            ></div>
          </div>
          {/* Conditional Arrow (NOW outside relative wrapper, sibling in flex row) */}
          {isMainFilterScrollable && (
            <div className="flex-shrink-0">
              <ChevronRight className="h-5 w-5 text-primary opacity-70" />
            </div>
          )}
        </div>
      </div>

      {/* Subgroup filters */}
      {activeGroup && activeGroup !== FilterGroupType.ORDER_TYPE && (
        <div className="bg-secondary bg-opacity-20 rounded-md">
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
