import { cn } from "@/lib/utils";

const colorMap = {
  "text-primary": "#2a386b", // Purple
  "text-secondary": "#58bf4b", // Green
  "text-terciary": "#4B75E7", // Blue
  "text-white": "#ffffff",
  "text-purple": "#8B5CF6", // Purple for the shop
  "text-yellow": "#F59E0B", // Yellow for roof and details
  "text-black": "#000000",
};

type ColorKey = keyof typeof colorMap;

export function KioscoinIsometricIcon({
  className,
  shopColor = "text-purple",
  roofColor = "text-yellow",
  accentColor = "text-yellow",
}: {
  className?: string;
  shopColor?: ColorKey;
  roofColor?: ColorKey;
  accentColor?: ColorKey;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 120 100"
      fill="none"
    >
      {/* Main shop body - purple cube */}
      <path
        d="M25 50 L65 50 L65 80 L25 80 Z"
        fill={colorMap[shopColor] || shopColor}
        stroke={colorMap["text-black"]}
        strokeWidth="1.5"
      />

      {/* Right side of shop */}
      <path
        d="M65 50 L85 40 L85 70 L65 80 Z"
        fill={colorMap[shopColor] || shopColor}
        stroke={colorMap["text-black"]}
        strokeWidth="1.5"
      />

      {/* Roof - yellow */}
      <path
        d="M25 50 L65 50 L85 40 L45 40 Z"
        fill={colorMap[roofColor] || roofColor}
        stroke={colorMap["text-black"]}
        strokeWidth="1.5"
      />

      {/* Awning - purple */}
      <path
        d="M20 50 L30 50 L30 58 L20 58 Z"
        fill={colorMap[shopColor] || shopColor}
        stroke={colorMap["text-black"]}
        strokeWidth="1"
      />

      {/* Doorway - yellow interior */}
      <path
        d="M35 65 L45 65 L45 80 L35 80 Z"
        fill={colorMap[accentColor] || accentColor}
        stroke={colorMap["text-black"]}
        strokeWidth="1"
      />

      {/* Coin emblem on right side */}
      <circle
        cx="75"
        cy="60"
        r="10"
        fill={colorMap[accentColor] || accentColor}
        stroke={colorMap["text-black"]}
        strokeWidth="1"
      />

      {/* Vertical lines in coin */}
      <line
        x1="72"
        y1="55"
        x2="72"
        y2="65"
        stroke={colorMap["text-black"]}
        strokeWidth="1.5"
      />
      <line
        x1="78"
        y1="55"
        x2="78"
        y2="65"
        stroke={colorMap["text-black"]}
        strokeWidth="1.5"
      />

      {/* Decorative elements under awning */}
      <path
        d="M22 58 L26 58 L24 62 Z"
        fill={colorMap[accentColor] || accentColor}
        stroke={colorMap["text-black"]}
        strokeWidth="0.5"
      />
      <path
        d="M27 58 L31 58 L29 62 Z"
        fill={colorMap[accentColor] || accentColor}
        stroke={colorMap["text-black"]}
        strokeWidth="0.5"
      />
    </svg>
  );
}
