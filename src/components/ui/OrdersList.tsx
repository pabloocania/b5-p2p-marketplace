import { useState, useEffect } from "react";
import  Filter from "./Filter"; // Componente de filtros
import { OrderCard } from "./OrderCard"; // Componente de tarjeta de orden
import { getOrders } from "b5-api-client"; // Método para obtener las órdenes desde la API

const OrdersList = () => {
  const [filters, setFilters] = useState({
    orderType: "BUY",
    paymentMethod: "banco",
    stablecoin: "usdt",
    blockchain: "ethereum",
  });

  const [orders, setOrders] = useState([]); // Estado para las órdenes filtradas
  const [loading, setLoading] = useState(false); // Estado para indicar si estamos cargando datos

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters); // Actualizamos los filtros
  };

  const fetchFilteredOrders = async () => {
    setLoading(true); // Comenzamos la carga
    try {
      const response = await getOrders(filters); // Usamos el cliente API para obtener las órdenes
      setOrders(response); // Actualizamos las órdenes con los datos obtenidos
    } catch (error) {
      console.error("Error al obtener las órdenes:", error);
    } finally {
      setLoading(false); // Terminamos la carga
    }
  };

  // Llamamos a la API cada vez que los filtros cambian
  useEffect(() => {
    fetchFilteredOrders();
  }, [filters]); // Dependemos de los filtros para realizar la llamada

  return (
    <div className="order-filter">
      <Filter onFilterChange={handleFilterChange} /> {/* Filtros */}
      
      {loading ? (
        <p>Cargando...</p> // Aquí podrías agregar un spinner o una barra de progreso
      ) : (
        <div className="order-list mt-4">
          {orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard key={order.id} orderDTO={order} />
            ))
          ) : (
            <p>No se encontraron órdenes que coincidan con los filtros.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersList;