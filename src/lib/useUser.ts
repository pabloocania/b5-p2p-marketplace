import { useState } from "react";
import { disconnect } from '@wagmi/core'
import { config } from '../wagmi'

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
        disconnect(config)
    };

    return {
        user,
        isLoggedIn: !!user,
        login,
        logout,
    };
}