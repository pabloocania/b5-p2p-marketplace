import { useState } from "react";

export interface UserProps {
    username: string;
    email?: string;
    userId: string;
    avatarUrl?: string;
}

export function useUser() {
    const [user, setUser] = useState<UserProps | undefined>(undefined);

    const login = (userData: UserProps) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(undefined);
    };

    return {
        user,
        isLoggedIn: !!user,
        login,
        logout,
    };
}