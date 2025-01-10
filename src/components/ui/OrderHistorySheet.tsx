import React, { useState, useEffect, useRef } from "react";

const OrderHistorySheet = () => {
  const [isSheetVisible, setSheetVisible] = useState(false);
  const sheetRef = useRef(null);

  // Datos mockeados para el historial de pedidos
  const mockOrderHistory = [
    { id: 1, date: "2023-01-01", total: "$100.00" },
    { id: 2, date: "2023-02-15", total: "$200.00" },
    { id: 3, date: "2023-03-20", total: "$150.00" },
  ];

  const toggleSheetVisibility = () => {
    setSheetVisible(!isSheetVisible);
  };

  // Escuchar clics fuera del panel para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target)) {
        setSheetVisible(false);
      }
    };

    if (isSheetVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSheetVisible]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        height: "100%",
      }}
    >
      <a
        href="#"
        onClick={toggleSheetVisibility}
        style={{
          textDecoration: "underline",
          color: "blue",
          padding: "10px",
          marginRight: "20px",
        }}
      >
        Order History Sheet!
      </a>
      {isSheetVisible && (
        <div
          ref={sheetRef}
          style={{
            position: "absolute",
            width: "200px",
            height: "auto",
            background: "white",
            border: "1px solid black",
            padding: "10px",
          }}
        >
          <ul>
            {mockOrderHistory.map((order) => (
              <li key={order.id}>
                Order ID: {order.id}, Date: {order.date}, Total: {order.total}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderHistorySheet;
