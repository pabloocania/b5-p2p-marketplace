import { useState, useEffect } from "react";
import Filters from "./Filters"; 
import { OrderCard } from "./OrderCard"; 
import { p2pMarketAPIClient as client } from "../../lib/APIClients";


const OrderFilter = () => {
  const [filters, setFilters] = useState({
    orderType: "BUY",
    paymentMethod: "banco",
    stablecoin: "usdt",
    blockchain: "ethereum",
  });

  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(false); 

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters); 
  };

  const fetchFilteredOrders = async () => {
    setLoading(true); 
    try {
      console.log("Enviando filtros:", filters);
      const response = await client.getOrders(filters); 
      console.log("Órdenes recibidas:", response);
      setOrders(response); 
    } catch (error) {
      console.error("Error al obtener las órdenes:", error);
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    fetchFilteredOrders();
  }, [filters]); 

  return (
    <div className="order-filter">
      <Filters onFilterChange={handleFilterChange} /> 
      
      {loading ? (
        <p>Cargando...</p> 
      ) : (
        <div className="order-list mt-4">
          {orders.length > 0 ? (
            orders.map((order, index) => (
              <OrderCard key={index} orderDTO={order} />
            ))            
          ) : (
            <p>No se encontraron órdenes que coincidan con los filtros.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderFilter;
