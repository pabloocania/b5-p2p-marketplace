import React from "react";

interface CryptoIconProps {
  tokenCode: string; // Código del token (por ejemplo, "btc", "eth", "usdt")
  amount: number;    // Monto de la criptomoneda
}

export const CryptoIcon: React.FC<CryptoIconProps> = ({ tokenCode, amount }) => {
  const tokenCodeLower = tokenCode.toLowerCase();
  const iconSrc = `https://cdn.jsdelivr.net/npm/cryptocurrency-icons/svg/color/${tokenCodeLower}.svg`;

  return (
    <div className="flex items-center space-x-2 justify-center">
      <span className="font-bold text-[12px] mt-[3px]">  <i className="font-extrabold">{amount}</i> &nbsp;&nbsp; {tokenCode.toUpperCase()} </span>
      <img src={iconSrc} alt={tokenCode} className="w-[16px] h-[16px]" />
    </div>
  );
};