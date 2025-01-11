import React from "react";

const mockData = {
  order_events: [
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
  ],
};

export default function OrderHistory() {
  const orderEvents = mockData.order_events; // Usamos directamente el mockData

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Order Timeline</h2>
      {orderEvents.map((event, index) => (
        <div key={index} className="flex items-center space-x-2 mb-4">
          <span>
            {event.event_type === "TAKEN" && "🛒"}
            {event.event_type === "LOCKED" && "🔒"}
            {event.event_type === "FIAT_SENT" && "💸"}
            {event.event_type === "RELEASED" && "✅"}
          </span>
          <div>
            <p className="font-bold">{event.event_type}</p>
            <p className="text-sm text-gray-600">
              {new Date(event.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
