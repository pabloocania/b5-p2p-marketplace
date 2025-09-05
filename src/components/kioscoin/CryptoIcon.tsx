import React from "react";

interface CryptoAmountIconProps {
  tokenCode: string; // Código del token (por ejemplo, "btc", "eth", "usdt")
  formattedAmount?: string; // Monto de la criptomoneda
  showAmount?: boolean; // Flag to control if amount is displayed
  showTokenCode?: boolean; // Flag to control if token code is displayed next to image
  textSizeClass?: string; // Class for text size
  decimals?: number;
  amountTextClassName?: string; // Optional class to style amount + token text
}

export const CryptoAmountIcon: React.FC<CryptoAmountIconProps> = ({
  tokenCode,
  formattedAmount,
  showAmount = true,
  showTokenCode = false,
  textSizeClass = "text-2xl",
  amountTextClassName,
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

  // Determine image size based on amount length
  const getImageSize = () => {
    if (!formattedAmount) return "w-[25px] h-[25px]";

    const length = formattedAmount.length;

    if (length > 9) return "w-[18px] h-[18px]";
    if (length > 7) return "w-[20px] h-[20px]";
    return "w-[25px] h-[25px]";
  };

  const imageSize = getImageSize();
  const [imgError, setImgError] = React.useState(false);
  const fallbackSrc = "/criptoicon/asset-placeholder.svg";

  const amountTextClasses = amountTextClassName
    ? `${amountFontSize} ${amountTextClassName}`
    : `${amountFontSize} font-bold text-black`;

  return (
    <div className="inline-flex items-center justify-center">
      {showAmount && formattedAmount && (
        <span className={amountTextClasses}>
          {formattedAmount} {tokenCode.toUpperCase()}
        </span>
      )}
      <img
        src={imgError ? fallbackSrc : iconSrc}
        alt={tokenCode}
        className={imageSize}
        onError={() => setImgError(true)}
      />
      {showTokenCode && (
        <span className={`${textSizeClass} font-secondary text-gray-700 ml-1`}>
          {tokenCode.toUpperCase()}
        </span>
      )}
    </div>
  );
};
