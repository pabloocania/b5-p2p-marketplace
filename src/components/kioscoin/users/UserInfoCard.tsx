import { UserStats } from "./UserStats";
import { Order, KioscoinUser } from "b5-api-client";

interface UserInfoCardProps {
  user?: KioscoinUser;
  order?: Order;
}

export const UserInfoCard = ({ user, order }: UserInfoCardProps) => {
  return (
    <div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1 bg-primary/20 rounded-lg p-2 w-full">
      <span className="font-bold text-[clamp(1.2rem,2vw,1.3rem)] text-primary shrink-0">
        {user?.username ||
          (order?.type === "SELL"
            ? "@" + order?.sellerUsername
            : "@" + order?.buyerUsername)}
      </span>
      <div className="flex-grow">
        {(user && (
          <UserStats
            rating={user.totalRating ?? "0"}
            transactionCount={Number(user.tradesCompleted ?? "0")}
            userMetrics={{
              userId: user.id ?? "",
              avgTimeToLock: user.timeToLock ?? 0,
              avgTimeToRelease: user.timeToRelease ?? 0,
              avgTimeToFiatSent: user.timeToFiatSent ?? 0,
            }}
          />
        )) ||
          (order && (
            <UserStats
              rating={order.creatorRating ?? "0"}
              transactionCount={Number(order.transactionsCount ?? "0")}
              userMetrics={
                order.userMetrics && order.userMetrics.length > 0
                  ? order.userMetrics[0]
                  : undefined
              }
              isSeller={order.type === "SELL"}
            />
          ))}
      </div>
    </div>
  );
};
