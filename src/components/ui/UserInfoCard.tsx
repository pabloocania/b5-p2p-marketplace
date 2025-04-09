import { UserProps } from "@/lib/useUser";
import { UserStats } from "./UserStats";
import { Order } from "b5-api-client";

interface UserInfoCardProps {
  user?: UserProps;
  order?: Order;
}

export const UserInfoCard = ({ user, order }: UserInfoCardProps) => {
  return (
    <div className="flex space-x-2 items-center bg-terciary/10 rounded-lg p-2">
      <span className="font-bold text-[clamp(1.2rem,2vw,1.3rem)] text-terciary w-full">
        {order?.type === "SELL"
          ? "@" + order?.sellerUsername
          : "@" + order?.buyerUsername}
      </span>
      {order && (
        <UserStats
          rating={order.creatorRating}
          transactionCount={Number(order.transactionsCount)}
        />
      )}
    </div>
  );
};
