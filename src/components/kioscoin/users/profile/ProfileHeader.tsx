import React, { useState } from "react";
import { AvatarSelector } from "./AvatarSelector";
import { UserStats } from "./UserStats";
import { KioscoinUser } from "b5-api-client";

interface ProfileHeaderProps {
  user: KioscoinUser;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const [selectedAvatar, setSelectedAvatar] = useState("M");

  return (
    <div className="flex items-start bg-primary/10 rounded-lg p-3 w-full gap-4 shadow-md border border-primary/10">
      <AvatarSelector
        selectedAvatar={selectedAvatar}
        onAvatarChange={setSelectedAvatar}
      />

      {/* Contenido vertical con altura controlada */}
      <div className="flex-grow flex flex-col justify-between h-16">
        {/* Username arriba - alineado con margen superior del avatar */}
        <div className="flex items-start">
          <span className="text-xl text-dark font-primary">
            {user.username}
          </span>
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
