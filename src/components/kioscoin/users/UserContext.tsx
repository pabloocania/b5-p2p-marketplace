import React, { createContext, useContext } from "react";
import { useUser } from "./useUser";
import { KioscoinUser } from "b5-api-client";

interface UserContextProps {
  user: KioscoinUser | undefined;
  isLoggedIn: boolean;
  login: (userData: KioscoinUser, loginId: string) => void;
  logout: () => void;
  loginId: string | undefined;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC = ({ children }) => {
  const user = useUser();
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
