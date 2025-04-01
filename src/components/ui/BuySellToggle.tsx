import React, { useState } from "react";

const BuySellToggle: React.FC = () => {
  const [type, setType] = useState("buy"); // Estado para seleccionar 'buy' o 'sell'

  const handleClick = (newType: string) => {
    setType(newType);
  };

  return (
    <div className="flex justify-center gap-4 mt-4 p-2 bg-gray-400 rounded-full">
      {/* Botón de Compra */}
      <button
        onClick={() => handleClick("buy")}
        className={`px-2 py-2 rounded-full text-xs text-white transition duration-300 ${
          type === "buy" ? "bg-black" : "none"
        } hover:none focus:outline-none`}
      >
        Compra
      </button>

      {/* Botón de Venta */}
      <button
        onClick={() => handleClick("sell")}
        className={`px-4 py-2 rounded-full text-xs text-white transition duration-300 ${
          type === "sell" ? "bg-black" : "none"
        } hover:none focus:outline-none`}
      >
        Venta
      </button>
    </div>
  );
};

export default BuySellToggle;