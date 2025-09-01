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
    <div className="flex items-start bg-primary/10 rounded-lg p-4 w-full gap-4">
      {/* Avatar cuadrado que ocupa toda la altura */}
      <AvatarSelector 
        selectedAvatar={selectedAvatar} 
        onAvatarChange={setSelectedAvatar} 
      />

      {/* Contenido vertical con altura controlada */}
      <div className="flex-grow flex flex-col justify-between h-16">
        {/* Username arriba - alineado con margen superior del avatar */}
        <div className="flex items-start">
          <span className="text-lg font-medium text-primary leading-tight">
            {user.username}
          </span>
        </div>

        {/* Stats abajo - alineados con línea inferior del avatar */}
        <div className="flex items-end">
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
