import React from "react";

interface CryptoAmountIconProps {
  tokenCode: string; // Código del token (por ejemplo, "btc", "eth", "usdt")
  amount: string; // Monto de la criptomoneda
}

export const CryptoAmountIcon: React.FC<CryptoAmountIconProps> = ({
  tokenCode,
  amount,
}) => {
  const tokenCodeLower = tokenCode.toLowerCase();
  const isGenericIcon = tokenCodeLower === "pdoc" || tokenCodeLower === "usdk";

  // Si es PDOC o USDK, usa el ícono genérico de la carpeta public/criptoicon
  const iconSrc = isGenericIcon
    ? `/criptoicon/${tokenCodeLower}.svg`
    : `https://cdn.jsdelivr.net/npm/cryptocurrency-icons/svg/color/${tokenCodeLower}.svg`;

  return (
    <div className="flex items-center w-full">
      <span className="font-medium text-2xl font-bold text-terciary">
        {amount} {tokenCode.toUpperCase()}{" "}
      </span>
      <img src={iconSrc} alt={tokenCode} className="pl-1 w-[25px] h-[25px]" />
    </div>
  );
};
