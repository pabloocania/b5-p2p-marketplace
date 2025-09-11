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
    <div className="space-y-3">
      {events.map((event, index) => (
        <div key={index} className="bg-terciary/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 text-center">
                {event.eventType === "TAKEN" && "🛒"}
                {event.eventType === "LOCKED" && "🔒"}
                {event.eventType === "FIAT_SENT" && "💸"}
                {event.eventType === "RELEASED" && "✅"}
              </div>
              <span className="font-secondary text-dark/80">
                {event.eventType === "TAKEN" && (
                  <>
                    {t("order_taken_event").split(" ")[0]}
                    <br />
                    {t("order_taken_event").split(" ")[1]}
                  </>
                )}
                {event.eventType === "LOCKED" && (
                  <>
                    {t("order_locked").split(" ")[0]}
                    <br />
                    {t("order_locked").split(" ")[1]}
                  </>
                )}
                {event.eventType === "FIAT_SENT" && (
                  <>
                    {t("fiat_transferred").split(" ")[0]}
                    <br />
                    {t("fiat_transferred").split(" ")[1]}
                  </>
                )}
                {event.eventType === "RELEASED" && (
                  <>
                    {t("order_released").split(" ")[0]}
                    <br />
                    {t("order_released").split(" ")[1]}
                  </>
                )}
              </span>
            </div>
            <span className="text-sm text-dark/80 text-right w-36 whitespace-nowrap font-secondary">
              {new Date(event.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
