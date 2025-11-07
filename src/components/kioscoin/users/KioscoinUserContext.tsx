import React, { createContext, useContext } from "react";
import { useKioscoinUser } from "./useKioscoinUser";
import { KioscoinUser, UserData } from "b5-api-client";

interface KioscoinUserContextProps {
  user: KioscoinUser | undefined;
  isLoggedIn: boolean;
  login: (user: KioscoinUser, userData: UserData) => Promise<void>;
  logout: () => void;
  loginId: string | undefined;
  emailVerified: boolean;
}

const KioscoinUserContext = createContext<KioscoinUserContextProps | undefined>(
  undefined
);

export const KioscoinUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const kioscoinUser = useKioscoinUser();
  return (
    <KioscoinUserContext.Provider value={kioscoinUser}>
      {children}
    </KioscoinUserContext.Provider>
  );
};

export const useKioscoinUserContext = () => {
  const context = useContext(KioscoinUserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
