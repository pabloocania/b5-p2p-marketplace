"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

export default function InfoToggle({ content = "" }) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHovered && containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top =
        containerRect.top +
        window.scrollY +
        containerRect.height / 2 -
        tooltipRect.height / 2 +
        45;
      let left =
        containerRect.left +
        window.scrollX +
        containerRect.width / 2 -
        tooltipRect.width / 2;

      // Ensure the tooltip doesn't go off-screen
      top = Math.max(
        window.scrollY + 10,
        Math.min(
          top,
          window.scrollY + window.innerHeight - tooltipRect.height - 10
        )
      );
      left = Math.max(
        10,
        Math.min(left, window.innerWidth - tooltipRect.width - 10)
      );

      tooltipRef.current.style.top = `${top}px`;
      tooltipRef.current.style.left = `${left}px`;
    }
  }, [isHovered]);

  return (
    <div
      ref={containerRef}
      className="inline-block relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="inline-flex items-center justify-center">
        <Info className="h-3 w-3 text-gray-500" aria-hidden="true" />
      </span>
      {isHovered && (
        <div
          ref={tooltipRef}
          className="fixed w-60 max-w-[calc(100vw-2rem)] text-xs p-3 bg-white border border-gray-300 rounded-lg shadow-lg"
          role="tooltip"
        >
          <div className="break-words whitespace-pre-wrap">{content}</div>
        </div>
      )}
    </div>
  );
}
