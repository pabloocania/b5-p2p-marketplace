import React from "react";
import { BadgeCheck } from "lucide-react";
import { AvatarSelector } from "./AvatarSelector";
import { UserStats } from "./UserStats";
import { KioscoinUser } from "b5-api-client";

interface ProfileHeaderProps {
  user: KioscoinUser;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const isVerified = user.settings?.hasVerified ?? false;

  return (
    <div className="flex items-center bg-primary/10 rounded-lg p-3 w-full gap-4 shadow-md border border-primary/10">
      {/* <AvatarSelector isVerified={isVerified} /> */}

      {/* Contenido vertical con altura controlada */}
      <div className="flex-grow flex flex-col justify-between h-16 items-center">
        {/* Username arriba - alineado con margen superior del avatar */}
        <div className="flex items-center gap-1">
          <span className="text-xl text-dark font-primary leading-none">
            {user.username}
          </span>
          {isVerified && (
            <span
              className={`inline-flex items-center bg-primary/20 rounded-lg text-xs text-primary mt-2`}
            >
              <BadgeCheck className="w-4 h-4 text-primary" />
            </span>
          )}
        </div>

        {/* Stats abajo - alineados con línea inferior del avatar */}
        <div className="flex items-end font-secondary">
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
        </div>
      </div>
    </div>
  );
};
