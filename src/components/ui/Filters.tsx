import { useState } from "react";

const Filters = ({ onFilterChange }: { onFilterChange: (filters: any) => void }) => {
  const [filters, setFilters] = useState({
    orderType: "Buy",
    paymentMethod: "",
    stablecoin: "", // Filtrar por tokenCode
    blockchain: "", // Si deseas implementar blockchain
  });

  // Cambia el valor de un filtro y notifica el cambio
  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      onFilterChange(newFilters); // Notificar el cambio
      return newFilters;
    });
  };

  return (
    <div className="p-4">
      <div className="flex flex-row justify-center items-center gap-x-4">
        {/* Tipo de Orden (Toggle) */}
        <div className="flex gap-x-1">
          <button
            onClick={() => updateFilter("orderType", filters.orderType === "BUY" ? "SELL" : "BUY")}
            className={`w-16 h-8 text-xs border border-secondary bg-white text-center rounded-xl shadow-lg transition-all ${
              filters.orderType === "BUY" ? "text-black" : "text-black"
            }`}
          >
            {filters.orderType === "BUY" ? "Compra" : "Venta"}
          </button>
        </div>

        {/* Método de Pago (Dropdown) */}
        <div>
        
          <select
            value={filters.paymentMethod}
            onChange={(e) => updateFilter("paymentMethod", e.target.value)}
            className="w-24 h-8 p-1 text-xs text-center border appearance-none border-secondary rounded-xl shadow-lg"
          >
            <option value="banco">Transferencias</option>
            <option value="paypal">PayPal</option>
            <option value="crypto">Criptomonedas</option>
          </select>
        </div>

        {/* Stablecoin (Toggle) */}
     <div className="flex gap-x-1">
            <select value={filters.stablecoin} onChange={(e) => updateFilter("stablecoin", e.target.value)}
               className="w-24 h-8 p-1 text-xs text-center border appearance-none border-secondary rounded-xl shadow-lg">
            <option value="usdt">USDT</option>
            <option value="usdc">USDC</option>
            <option value="pdoc">PDOC</option>
            <option value="usdk">USDK</option>
          </select>
        </div> 

      

        {/* Blockchain (Dropdown) */}
         <div>
          <select
            value={filters.blockchain}
            onChange={(e) => updateFilter("blockchain", e.target.value)}
            className="w-24 h-8 p-1 text-xs text-center border appearance-none border-secondary rounded-xl shadow-lg"
          >
            <option value="ethereum">Ethereum</option>
            <option value="bsc">Binance Smart Chain</option>
            <option value="polygon">Polygon</option>
            <option value="solana">Solana</option>
          </select>
        </div>     
      </div>
      </div>
  );
};

export default Filters;

