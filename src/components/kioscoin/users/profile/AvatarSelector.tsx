import React from "react";
import { User, UserCheck } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

interface AvatarSelectorProps {
  isVerified: boolean;
  // For future use if selection is re-enabled:
  // onAvatarChange?: (avatar: string) => void;
}

const avatarConfig = {
  verified: {
    icon: UserCheck,
    bgColor: "bg-secondary/20",
    iconColor: "text-dark",
  },
  unverified: {
    icon: User,
    bgColor: "bg-error",
    iconColor: "text-white",
  },
};

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  isVerified,
}) => {
  // Selection disabled - avatar is now determined by verification status
  // const [isOpen, setIsOpen] = useState(false);

  const currentAvatar = isVerified
    ? avatarConfig.verified
    : avatarConfig.unverified;
  const Icon = currentAvatar.icon;

  return (
    <div
      className={`w-16 h-16 ${currentAvatar.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
    >
      <Icon className={`w-8 h-8 ${currentAvatar.iconColor}`} />
    </div>
  );

  /* Selection disabled - kept for future use if needed
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`w-16 h-16 ${currentAvatar.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer`}
        >
          <Icon className={`w-8 h-8 ${currentAvatar.iconColor}`} />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="start" className="w-64 p-3">
        <div className="space-y-2">
          <h4 className="font-secondary text-xs text-gray-400 mb-3">Elegir Avatar</h4>
          ...avatar options...
        </div>
      </PopoverContent>
    </Popover>
  );
  */
};
