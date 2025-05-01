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
    // NEW Flex row wrapper
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Relative wrapper for Scroll + Fade */}
      <div className="relative flex-grow min-w-0">
        {/* Scrollable container with padding */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-2 scrollbar-hide whitespace-nowrap px-2 py-2 rounded-md items-center" // <-- Added items-center for vertical alignment
        >
          {/* Render leading nodes if provided */}
          {leadingNodes &&
            leadingNodes.map((node, index) => (
              <div key={`leading-${index}`} className="shrink-0">
                {node}
              </div>
            ))}
          {/* Render badges */}
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
                className={`cursor-pointer text-xs capitalize ${minWidthClass} flex items-center justify-center px-1 shrink-0 border border-secondary/50 ${
                  isSelected
                    ? "bg-secondary text-white"
                    : "bg-white text-primary"
                }`}
                onClick={() => onToggle(item)}
              >
                {renderItemContent(item)}
                {isSelected && (
                  <X
                    className="ml-1 h-3 w-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(item);
                    }}
                  />
                )}
              </Badge>
            );
          })}
        </div>
        {/* Fade effect (absolute inside relative parent) */}
        {/* Show fade only if scrollable */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-secondary/10 via-secondary/5 to-transparent pointer-events-none rounded-r-md transition-opacity duration-300 ${
            isScrollable ? "opacity-100" : "opacity-0"
          }`}
        ></div>
      </div>
      {/* Conditional Arrow (outside relative wrapper, sibling in flex row) */}
      {isScrollable && (
        <div className="flex-shrink-0">
          <ChevronRight className="h-5 w-5 text-primary opacity-70" />
        </div>
      )}
    </div>
  );
}

export default BadgeGroup;
