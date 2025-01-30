import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface OrderCreatedDateProps {
  createdAt: string | undefined;
}

const OrderCreatedDate: React.FC<OrderCreatedDateProps> = ({ createdAt }) => {
  if (!createdAt) return null;

  const { t } = useTranslation(); // ✅ Move this inside the component
  const formattedDate = format(new Date(createdAt), "dd-MM-yy");

  return (
    <div className="flex items-center text-gray-300 text-xs">
      <Calendar className="w-3 h-3 mr-1" />
      <span>
        {t("created")} {formattedDate}
      </span>
    </div>
  );
};

export default OrderCreatedDate;
