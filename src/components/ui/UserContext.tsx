import React, { createContext, useContext } from "react";
import { useUser, UserProps } from "../../lib/useUser";

interface UserContextProps {
  user: UserProps | undefined;
  isLoggedIn: boolean;
  login: (userData: UserProps) => void;
  logout: () => void;
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
