"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface CompactSelectorItem {
  code: string;
  name: string;
  icon: string;
}

export interface CompactSelectorProps {
  items: ReadonlyArray<CompactSelectorItem>;
  selectedCode?: string;
  onChange: (code: string) => void;
  align?: "start" | "end" | "center";
  loadingLabel?: string;
  contentClassName?: string;
  buttonAriaLabel?: string;
}

export function CompactSelector({
  items,
  selectedCode,
  onChange,
  align = "start",
  loadingLabel = "Loading...",
  contentClassName,
  buttonAriaLabel,
}: CompactSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = useMemo(() => {
    return items.find((i) => i.code === selectedCode) || items[0];
  }, [items, selectedCode]);

  const renderIcon = (icon: string, size: "sm" | "md") => {
    const className = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    if (icon.startsWith("/") || icon.startsWith("http")) {
      return <img src={icon} alt="icon" className={className} />;
    }
    return (
      <span className={size === "sm" ? "text-sm" : "text-lg"}>{icon}</span>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={buttonAriaLabel}
          className="flex items-center gap-1 bg-secondary/10 border-secondary/30 hover:bg-secondary/20"
        >
          {selected ? (
            renderIcon(selected.icon, "md")
          ) : (
            <span className="text-sm">?</span>
          )}
          <ChevronDown className="h-3 w-3 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={`w-40 ${contentClassName ?? ""}`.trim()}
      >
        {items.length > 0 ? (
          items.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                onChange(item.code);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded-md"
            >
              {renderIcon(item.icon, "md")}
              <span className="font-medium">{item.name}</span>
            </button>
          ))
        ) : (
          <div className="p-2 text-gray-500">{loadingLabel}</div>
        )}
      </PopoverContent>
    </Popover>
  );
}
