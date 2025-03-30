import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface OrderCreatedDateProps {
  createdAt: string;
}

const OrderCreatedDate: React.FC<OrderCreatedDateProps> = ({ createdAt }) => {
  if (!createdAt) return null;

  const { t } = useTranslation(); // ✅ Move this inside the component
  const formattedDate = format(new Date(createdAt), "dd-MM-yy - HH:mm");

  return (
    <div className="flex justify-end items-center text-xxs w-full text-gray-500 pb-1">
      <Calendar className="w-3 h-2 mr-1" />
      <span>
        {t("created")} {formattedDate}
      </span>
    </div>
  );
};

export default OrderCreatedDate;
