import { useState, useEffect } from "react";
import { p2pMarketAPIClient as client } from "../../../lib/APIClients";
import { useUserContext } from "../users/UserContext";
import { useTranslation } from "react-i18next";

interface OrderEvent {
  eventType: string;
  timestamp: string;
}

interface OrderHistoryProps {
  orderId: string | undefined;
}

export default function OrderHistory({ orderId }: OrderHistoryProps) {
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { loginId } = useUserContext();

  useEffect(() => {
    if (!orderId) {
      console.warn("No orderId provided to OrderHistory component.");
      return;
    }

    const fetchOrderEvents = async () => {
      setLoading(true);
      try {
        const response = await client.getOrderEvents(orderId, {
          Authorization: `Bearer ${loginId}`,
        });
        setEvents(response.orderEvents || []);
      } catch (err: any) {
        console.error("Error fetching order events:", err);
        setError(err.message || "Error fetching order events.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderEvents();
  }, [orderId]);

  if (loading) return <p className="font-secondary">t{"loading_status"}</p>;
  if (error)
    return <p className="text-red-500 font-secondary">Error: {error}</p>;
  if (events.length === 0)
    return <p className="font-secondary">{t("no_events_registered")}</p>;

  return (
    <div>
      {events.map((event, index) => (
        <div key={index} className="flex items-center justify-between mb-4">
          <span className="flex items-center space-x-2 font-secondary text-dark/80">
            {event.eventType === "TAKEN" && `${t("order_taken_event")} 🛒`}
            {event.eventType === "LOCKED" && `${t("order_locked")} 🔒`}
            {event.eventType === "FIAT_SENT" && `${t("fiat_transferred")} 💸`}
            {event.eventType === "RELEASED" && `${t("order_released")} ✅`}
          </span>
          <span className="text-sm text-dark/80 text-right w-36 whitespace-nowrap font-secondary">
            {new Date(event.timestamp).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
