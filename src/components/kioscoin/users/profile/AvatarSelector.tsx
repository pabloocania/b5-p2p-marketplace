import React, { useState } from "react";
import { User, UserCheck, UserX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AvatarSelectorProps {
  selectedAvatar: string;
  onAvatarChange: (avatar: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onAvatarChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Definir los 3 tipos de avatares estéticos
  const avatarOptions = [
    {
      id: "M",
      icon: User,
      label: "Avatar Minimalista",
      description: "Estilo simple y elegante", tag: "Minimal",
      bgColor: "bg-primary/20",
      iconColor: "text-primary",
    },
    {
      id: "V",
      icon: UserCheck,
      label: "Avatar Verificado",
      description: "Estilo confiable y seguro", tag: "Verified",
      bgColor: "bg-green-500/20",
      iconColor: "text-green-600",
    },
    {
      id: "X",
      icon: Users,
      label: "Avatar Social",
      description: "Estilo comunitario y conectado", tag: "Social",
      bgColor: "bg-purple-500/20",
      iconColor: "text-purple-600",
    },
  ];

  const currentAvatar = avatarOptions.find(opt => opt.id === selectedAvatar) || avatarOptions[0];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`w-16 h-16 ${currentAvatar.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer`}
        >
          <currentAvatar.icon className={`w-8 h-8 ${currentAvatar.iconColor}`} />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="start" className="w-64 p-3">
        <div className="space-y-2">
          <h4 className="font-secondary text-xs text-gray-400 mb-3">Elegir Avatar</h4>
          
          {avatarOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                onAvatarChange(option.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                selectedAvatar === option.id ? "bg-primary/10 border border-primary/20" : ""
              }`}
            >
              {/* Mini avatar preview */}
              <div className={`w-10 h-10 ${option.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <option.icon className={`w-5 h-5 ${option.iconColor}`} />
              </div>
              
              {/* Texto descriptivo */}
              <div className="text-left">
                <div className="font-secondary text-xs text-gray-500">{option.label}</div>
                <div className="text-xs text-gray-400 font-secondary">{option.tag}</div>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
