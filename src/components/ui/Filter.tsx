'use client';
import Image from "next/image";
import Select from "react-select";
import React, { useState } from "react";
import BuySellToggle from "@/components/ui/BuySellToggle"; // Asegúrate de que el componente esté bien implementado
import funnel from "../../../public/icon/funnel.svg"


interface FilterProps {
  onFilterChange: (filters: Filters) => void;
}

export interface Filters {
  type?: string;
  paymentMethod?: string;
  tokenCode?: string;
  blockchain?: string;
}

const tokenOptions = [
  { value: "usdt", label: "USDT", image: "/criptoicon/usdt.svg" },
  { value: "usdc", label: "USDC", image: "/criptoicon/usdc.svg"  },
  { value: "pdoc", label: "PDOC", image: "/criptoicon/pdoc.svg" },
  { value: "usdk", label: "USDK", image: "/criptoicon/usdk.svg" },
];

const paymentMethodOptions = [
  { value: "revoult", label: "Revoult",  image: "/criptoicon/revol.svg" },
  { value: "paypal", label: "Mercado Pago",  image: "/criptoicon/merc.png" },
];

const blockchainOptions = [
  { value: "ethereum", label: "Ethereum", image: "/criptoicon/eth.svg" },
  { value: "arbitrum", label: "Arbitrum", image: "/criptoicon/alg.svg" },
];

const Filter: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false); // Control de visibilidad de filtros

  // Función para manejar cambios en los select
  const handleChange = (name: keyof Filters, value: string | undefined) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Función para mostrar/ocultar filtros
  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };


  // Estilos comunes para los Select
  const commonSelectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: "#f3f4f6", // Gris claro
      borderRadius: "9999px", // Redondeo total
      border: "1px solid #d1d5db", // Borde gris
      padding: "1px",
      width: "130px",
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
      "&:hover": { borderColor: "#9ca3af" }, // Cambio de color al pasar el cursor
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "none",
      borderRadius: "8px",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    }),
    option: (base: any, { isFocused, isSelected }: any) => ({
      ...base,
      backgroundColor: isSelected ? "#3b82f6" : isFocused ? "#dbeafe" : "white",
      color: isSelected ? "white" : "#1f2937",
      padding: "10px",
      fontSize: "12px",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "black",
      fontSize: "12px",
    }),
    singleValue: (base: any) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      fontSize: "14px",
      fontWeight: "bold", // Texto en negrita
      color: "#00796b", // Color verde oscuro
      backgroundColor: "#e0f7fa", // Fondo azul claro
      borderRadius: "6px", // Bordes redondeados
    }),
    valueContainer: (base: any) => ({
      ...base,
      display: "flex",
      flexWrap: "nowrap", // Evita que los elementos se vayan a una segunda línea
      alignItems: "center", // Asegura que la imagen y el texto se alineen bien // Ajusta el espaciado entre la imagen y el texto
      fontSize: "10px",
    }),
  };
  

  return (
    <div className="w-full">
      <div className="flex justify-between">
        <div>
      <BuySellToggle /> {/* Asegúrate de que el componente de BuySellToggle esté manejando correctamente el estado de 'showFilters' */}
      </div>

        <button onClick={toggleFilters} className="flex justify-center items-center gap-2 mt-4 text-black">
        {showFilters ? "Filtros" : "Filtros"}
        <Image src={funnel} alt="funnel icon" width={20} />
       </button>

      </div>

      {showFilters && (
        <div className="flex justify-center flex-row gap-x-1 mt-4 rounded-4">
         <Select
              options={tokenOptions}
              onChange={(selectedOption) => handleChange("tokenCode", selectedOption?.value)}
             placeholder="Criptos"
             styles={commonSelectStyles}
             getOptionLabel={(e) => e.label} // Aquí solo retorna el texto
             formatOptionLabel={(e) => (
                <div className="flex items-center gap-2">
                 <Image src={e.image} alt={e.label} width={20} height={20} />
                 {e.label}
               </div>
              )}
            components={{
              SingleValue: ({ data }) => (
                <div className="flex items-center gap-2">
                  <Image src={data.image} alt={data.label} width={20} height={20} />
                  {data.label}
                </div>
              ),
            }}
            isSearchable={false} 
          />
          <Select
            options={paymentMethodOptions}
            onChange={(selectedOption) => handleChange("paymentMethod", selectedOption?.value)}
            placeholder="Pagos"
            styles={commonSelectStyles}
            getOptionLabel={(e) => (
              <div className="flex items-center gap-2">
                <Image src={e.image} alt={e.label} width={20} height={20} />
                {e.label}
              </div>
            )}
            components={{
              SingleValue: ({ data }) => (
                <div className="flex items-center gap-2">
                  <Image src={data.image} alt={data.label} width={20} height={20} />
                  {data.label}
                </div>
              ),
            }}
            isSearchable={false} 
          />
          <Select
            options={blockchainOptions}
            onChange={(selectedOption) => handleChange("blockchain", selectedOption?.value)}
            placeholder="Blockchain"
            styles={commonSelectStyles}
            getOptionLabel={(e) => (
              <div className="flex items-center gap-2">
                <Image src={e.image} alt={e.label} width={20} height={20} />
                {e.label}
              </div>
            )}
            components={{
              SingleValue: ({ data }) => (
                <div className="flex items-center gap-2">
                  <Image src={data.image} alt={data.label} width={20} height={20} />
                  {data.label}
                </div>
              ),
            }}
            isSearchable={false} 
          />
        </div>
      )}
    </div>
  );
};

export default Filter;
