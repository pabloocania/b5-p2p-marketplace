import React, { useState, useEffect, useRef } from "react";
import "../../../styles/OrderHistorySheet.module.css";

const OrderHistorySheet = () => {
  const [isSheetVisible, setSheetVisible] = useState(false);
  const sheetRef = useRef(null);

  // Datos reales para el historial de pedidos
  const orderEvents = [
    {
      order_id: "ea9a06be-5976-45b9-adb8-8558c802d033",
      timestamp: "2025-01-07T16:55:48.257-03:00",
      event_type: "TAKEN",
    },
    {
      order_id: "ea9a06be-5976-45b9-adb8-8558c802d033",
      timestamp: "2025-01-07T16:57:44.041-03:00",
      event_type: "LOCKED",
    },
    {
      order_id: "ea9a06be-5976-45b9-adb8-8558c802d033",
      timestamp: "2025-01-07T16:59:11.407-03:00",
      event_type: "FIAT_SENT",
    },
    {
      order_id: "ea9a06be-5976-45b9-adb8-8558c802d033",
      timestamp: "2025-01-07T17:01:32.926-03:00",
      event_type: "RELEASED",
    },
  ];

  const toggleSheetVisibility = () => {
    setSheetVisible(!isSheetVisible);
  };

  const closeSheet = () => {
    setSheetVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target)) {
        closeSheet();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Función para traducir event_type a un formato más legible
  const formatEventType = (eventType) => {
    switch (eventType) {
      case "TAKEN":
        return "📌 Order Taken";
      case "LOCKED":
        return "🔒 Order Locked";
      case "FIAT_SENT":
        return "💸 Fiat Sent";
      case "RELEASED":
        return "🚀 Order Released";
      default:
        return eventType;
    }
  };

  return (
    <div className="container">
      <button onClick={toggleSheetVisibility} className="historyButton">
        Order History Sheet!
      </button>
      {isSheetVisible && (
        <div ref={sheetRef} className="sheetContainer">
          <button onClick={closeSheet} className="closeButton">
            Close
          </button>
          <h3>Order History</h3>
          <ul>
            {orderEvents.map((event, index) => (
              <li key={index}>
                <strong>{formatEventType(event.event_type)}</strong> <br />
                <span>{new Date(event.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderHistorySheet;
