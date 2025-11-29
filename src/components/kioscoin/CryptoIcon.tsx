import React from "react";

interface CryptoAmountIconProps {
  tokenCode: string; // Código del token (por ejemplo, "btc", "eth", "usdt")
  formattedAmount?: string; // Monto de la criptomoneda
  showAmount?: boolean; // Flag to control if amount is displayed
  showTokenCode?: boolean; // Flag to control if token code is displayed next to image
  textSizeClass?: string; // Class for text size
  decimals?: number;
  amountTextClassName?: string; // Optional class to style amount + token text
  iconSize?: "sm" | "md"; // Size of the token icon image
}

export const CryptoAmountIcon: React.FC<CryptoAmountIconProps> = ({
  tokenCode,
  formattedAmount,
  showAmount = true,
  showTokenCode = false,
  textSizeClass = "text-2xl",
  amountTextClassName,
  iconSize = "md",
}) => {
  const tokenCodeLower = tokenCode.toLowerCase();
  const isGenericIcon = tokenCodeLower === "pdoc" || tokenCodeLower === "usdk";

  // Si es PDOC o USDK, usa el ícono genérico de la carpeta public/criptoicon
  const iconSrc = isGenericIcon
    ? `/criptoicon/${tokenCodeLower}.svg`
    : `https://cdn.jsdelivr.net/npm/cryptocurrency-icons/svg/color/${tokenCodeLower}.svg`;

  // Determine font size based on amount length
  const getAmountFontSize = () => {
    if (!formattedAmount) return textSizeClass;

    const length = formattedAmount.length;

    if (length > 9) return "text-sm";
    if (length > 7) return "text-base";
    return textSizeClass;
  };

  const amountFontSize = getAmountFontSize();

  // Determine image size based on explicit prop
  const getImageSize = () => {
    return iconSize === "sm" ? "w-[18px] h-[18px]" : "w-[25px] h-[25px]";
  };

  const imageSize = getImageSize();
  const [imgError, setImgError] = React.useState(false);
  const fallbackSrc = "/criptoicon/asset-placeholder.svg";

  // Si se proporciona amountTextClassName, usarlo; si no, usar el color gris por defecto
  const amountTextClasses = amountTextClassName
    ? `${amountFontSize} ${amountTextClassName}`
    : `${amountFontSize} font-bold`;

  // Solo aplicar el estilo inline si NO se proporciona amountTextClassName
  const inlineStyle = amountTextClassName
    ? {}
    : { color: "#1f2937 !important" };

  return (
    <span className="inline-flex items-center justify-center">
      {showAmount && formattedAmount && (
        <span className={amountTextClasses} style={inlineStyle}>
          {formattedAmount}
        </span>
      )}
      <span className={`text-primary ml-1 mr-1 ${textSizeClass || ""}`}>
        {tokenCode.toUpperCase()}
      </span>
      <img
        src={imgError ? fallbackSrc : iconSrc}
        alt={tokenCode}
        className={imageSize}
        onError={() => setImgError(true)}
      />
      {showTokenCode && (
        <span className={`${textSizeClass} font-secondary ml-1`}>
          {tokenCode.toUpperCase()}
        </span>
      )}
    </span>
  );
};
