import { UserStats } from "./UserStats";
import { Order, KioscoinUser } from "b5-api-client";

interface UserInfoCardProps {
  user?: KioscoinUser;
  order?: Order;
}

export const UserInfoCard = ({ user, order }: UserInfoCardProps) => {
  return (
    <div className="flex space-x-2 items-center bg-terciary/10 rounded-lg p-2">
      <span className="font-bold text-[clamp(1.2rem,2vw,1.3rem)] text-terciary w-full">
        {user?.username ||
          (order?.type === "SELL"
            ? "@" + order?.sellerUsername
            : "@" + order?.buyerUsername)}
      </span>
      {(user && (
        <UserStats
          rating={user.totalRating ?? "0"}
          transactionCount={Number(user.tradesCompleted ?? "0")}
        />
      )) ||
        (order && (
          <UserStats
            rating={order.creatorRating ?? "0"}
            transactionCount={Number(order.transactionsCount ?? "0")}
          />
        ))}
    </div>
  );
};
