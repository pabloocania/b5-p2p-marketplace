"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface KioscoinBrandProps {
  showSlogan?: boolean;
  size?: "sm" | "md" | "lg"; // controls image size
  className?: string;
  animateSlogan?: boolean;
}

// Ensures the image is prefetched once during app lifetime
const prefetched = new Set<string>();

export default function KioscoinBrand({
  showSlogan = false,
  size = "md",
  className,
  animateSlogan = true,
}: KioscoinBrandProps) {
  const { t } = useTranslation();
  const src = "/icons/kioscoin-imagotipo.png";
  const [verbIndex, setVerbIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!prefetched.has(src)) {
      const img = new Image();
      img.src = src;
      prefetched.add(src);
    }
  }, []);

  useEffect(() => {
    if (!showSlogan || !animateSlogan) return;
    intervalRef.current = setInterval(() => {
      setIsFading(true);
      timeoutRef.current = setTimeout(() => {
        setVerbIndex((v) => (v === 0 ? 1 : 0));
        setIsFading(false);
      }, 200);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showSlogan, animateSlogan]);

  const dims =
    size === "sm"
      ? { width: 140, height: 140 }
      : size === "lg"
      ? { width: 260, height: 260 }
      : { width: 200, height: 200 };

  return (
    <div className={cn("flex flex-col items-center pt-4", className)}>
      <img
        width={dims.width}
        height={dims.height}
        src={src}
        alt="Kioscoin"
        loading="eager"
        decoding="async"
      />
      {showSlogan && (
        <p className="text-center font-secondary sm:text-lg text-primary mt-1">
          <span
            className={cn(
              "inline-block transition-opacity duration-300 font-bold",
              isFading ? "opacity-0" : "opacity-100"
            )}
          >
            {t(verbIndex === 0 ? "buy_rioplatense" : "sell_rioplatense")}
          </span>
          {t("slogan_suffix")}
        </p>
      )}
    </div>
  );
}
