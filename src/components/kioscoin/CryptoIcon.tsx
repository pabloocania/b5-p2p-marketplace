import React from "react";

interface CryptoAmountIconProps {
  tokenCode: string; // Código del token (por ejemplo, "btc", "eth", "usdt")
  amount?: string; // Monto de la criptomoneda
  showAmount?: boolean; // Flag to control if amount is displayed
  textSizeClass?: string; // Class for text size
}

export const CryptoAmountIcon: React.FC<CryptoAmountIconProps> = ({
  tokenCode,
  amount,
  showAmount = true,
  textSizeClass = "text-2xl",
}) => {
  const tokenCodeLower = tokenCode.toLowerCase();
  const isGenericIcon = tokenCodeLower === "pdoc" || tokenCodeLower === "usdk";

  // Si es PDOC o USDK, usa el ícono genérico de la carpeta public/criptoicon
  const iconSrc = isGenericIcon
    ? `/criptoicon/${tokenCodeLower}.svg`
    : `https://cdn.jsdelivr.net/npm/cryptocurrency-icons/svg/color/${tokenCodeLower}.svg`;

  // Determine font size based on amount length
  const getAmountFontSize = () => {
    if (!amount) return textSizeClass;

    const numericValue = amount.replace(/,/g, "");
    const length = numericValue.length;

    if (length > 9) return "text-sm";
    if (length > 7) return "text-base";
    return textSizeClass;
  };

  const amountFontSize = getAmountFontSize();

  // Determine image size based on amount length
  const getImageSize = () => {
    if (!amount) return "w-[25px] h-[25px]";

    const numericValue = amount.replace(/,/g, "");
    const length = numericValue.length;

    if (length > 9) return "w-[18px] h-[18px]";
    if (length > 7) return "w-[20px] h-[20px]";
    return "w-[25px] h-[25px]";
  };

  const imageSize = getImageSize();

  return (
    <div className="inline-flex items-center justify-center">
      {showAmount && (
        <span
          className={`font-medium ${amountFontSize} font-bold text-terciary mr-1`}
        >
          {amount}
        </span>
      )}
      <span
        className={`font-medium ${amountFontSize} font-bold text-terciary flex items-center`}
      >
        {tokenCode.toUpperCase()}
        <img
          src={iconSrc}
          alt={tokenCode}
          className={`ml-1 ${imageSize}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `/criptoicon/generic.svg`;
          }}
        />
      </span>
    </div>
  );
};
