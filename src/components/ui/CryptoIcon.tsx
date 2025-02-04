import React from "react";

interface CryptoIconProps {
  tokenCode: string; // Código del token (por ejemplo, "btc", "eth", "usdt")
  amount: number;    // Monto de la criptomoneda
}

export const CryptoIcon: React.FC<CryptoIconProps> = ({ tokenCode, amount }) => {
  const tokenCodeLower = tokenCode.toLowerCase();
  const isGenericIcon = tokenCodeLower === "pdoc" || tokenCodeLower === "usdk";

  // Si es PDOC o USDK, usa el ícono genérico de la carpeta public/criptoicon
  const iconSrc = isGenericIcon
    ? `/criptoicon/${tokenCodeLower}.svg`
    : `https://cdn.jsdelivr.net/npm/cryptocurrency-icons/svg/color/${tokenCodeLower}.svg`;

  return (
    <div className="flex items-center space-x-2 justify-center">
      <span className="font-medium text-[20px]">  <i className="font-medium">{amount}</i> &nbsp;&nbsp; {tokenCode.toUpperCase()} </span>
      <img src={iconSrc} alt={tokenCode} className="w-[22px] h-[22px]" />
    </div>
  );
};
