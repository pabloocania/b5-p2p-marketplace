import React, { useState, useEffect } from "react";
import Filter, { Filters } from "@/components/ui/Filter";
import { OrderCard } from "@/components/ui/OrderCard"; // Asegúrate de importar correctamente tu componente
import { p2pMarketAPIClient as client } from "../../lib/APIClients"; // Supongamos que esta función obtiene las órdenes desde tu API

const OrdersFilter: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]); // Estado para todas las órdenes
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]); // Estado para las órdenes filtradas
  const [filters, setFilters] = useState<Filters>({}); // Estado para los filtros seleccionados

  
  // Obtener órdenes desde la API al cargar el componente
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await client.getOrders(); // Asegúrate de que este método existe en tu API
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error("Error al obtener órdenes:", error);
      }
    };

    loadOrders();
  }, []);

  // Aplicar filtros a las órdenes cada vez que cambian
  useEffect(() => {
    let filtered = orders;

    if (filters.tokenCode) {
      filtered = filtered.filter((order) => order.tokenCode === filters.tokenCode);
    }
    if (filters.paymentMethod) {
      filtered = filtered.filter((order) => order.paymentMethod === filters.paymentMethod);
    }
    if (filters.blockchain) {
      filtered = filtered.filter((order) => order.blockchain === filters.blockchain);
    }

    setFilteredOrders(filtered);
  }, [filters, orders]);

  // Función que actualiza los filtros desde el componente `Filter`
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <div>
      <Filter onFilterChange={handleFilterChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <p>No hay órdenes disponibles con los filtros seleccionados.</p>
        )}
      </div>
    </div>
  );
};

export default OrdersFilter;
