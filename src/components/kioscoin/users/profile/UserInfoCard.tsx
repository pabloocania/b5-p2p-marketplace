import { BadgeCheck } from "lucide-react";
import { UserStats } from "./UserStats";
import { Order, KioscoinUser } from "b5-api-client";

interface UserInfoCardProps {
  user?: KioscoinUser;
  order?: Order;
}

export const UserInfoCard = ({ user, order }: UserInfoCardProps) => {
  const isVerified =
    user?.settings?.hasVerified ??
    (order?.userMetrics && order.userMetrics.length > 0
      ? order.userMetrics[0].hasVerified
      : false);

  const username =
    user?.username ||
    (order?.type === "SELL" ? order?.sellerUsername : order?.buyerUsername);

  return (
    <div className="flex flex-col bg-primary/10 rounded-md space-y-2 p-2 w-full">
      <div className="flex items-center gap-1">
        <span className="text-sm text-dark font-primary leading-none">
          {username}
        </span>
        {isVerified && (
          <span
            className={`inline-flex items-center ounded-lg text-xs text-primary mt-1.5`}
          >
            <BadgeCheck className="w-3 h-3 text-primary" />
          </span>
        )}
      </div>
      <div className="font-secondary">
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
