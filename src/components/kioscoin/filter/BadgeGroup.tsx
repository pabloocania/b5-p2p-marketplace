"use client";
import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { X, ChevronRight } from "lucide-react";
import { BadgeGroupProps } from "./types";

function BadgeGroup<T>({
  options,
  selectedItems,
  onToggle,
  renderItemContent,
  getKey,
  leadingNodes,
  minWidthClass = "min-w-[90px]",
  className = "",
}: BadgeGroupProps<T>) {
  const [isScrollable, setIsScrollable] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScrollability = () => {
      const element = scrollContainerRef.current;
      if (element) {
        const hasOverflow = element.scrollWidth > element.clientWidth + 1;
        setIsScrollable(hasOverflow);
      }
    };

    checkScrollability(); // Initial check
    window.addEventListener("resize", checkScrollability);

    // Observe changes in the container's children
    const observer = new MutationObserver(checkScrollability);
    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      window.removeEventListener("resize", checkScrollability);
      observer.disconnect();
    };
  }, [options]); // Re-check when options change

  return (
    <div className={`w-full ${className}`}>
      {/* Leading nodes row */}
      {leadingNodes && leadingNodes.length > 0 && (
        <div className="flex items-center space-x-2 mb-2">
          {leadingNodes.map((node, index) => (
            <div key={`leading-${index}`} className="shrink-0">
              {node}
            </div>
          ))}
        </div>
      )}

      {/* Grid layout for badges - takes full width */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {options.map((item) => {
          // Check selection based on type
          const isSelected =
            typeof item === "object" &&
            item !== null &&
            "min" in item &&
            "max" in item
              ? selectedItems.some(
                  (sel) =>
                    typeof sel === "object" &&
                    sel !== null &&
                    "min" in sel &&
                    "max" in sel &&
                    sel.min === item.min &&
                    sel.max === item.max
                )
              : selectedItems.includes(item);

          return (
            <Badge
              key={getKey(item)}
              className={`cursor-pointer text-xs antialiased tracking-tight capitalize flex items-center justify-center border border-primary/50 ${
                isSelected
                  ? "bg-primary text-secondary"
                  : "bg-white text-primary/70"
              }`}
              onClick={() => onToggle(item)}
            >
              <span
                className={`flex items-center font-normal ${
                  isSelected ? "text-white" : "text-dark"
                }`}
              >
                {renderItemContent(item)}
                {/* {isSelected && (
                  <X
                    className="ml-1 h-2.5 w-2.5 text-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(item);
                    }}
                  />
                )} */}
              </span>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

export default BadgeGroup;
