import { useState } from "react";
import { disconnect } from '@wagmi/core'
import { config } from '../wagmi'
import { KioscoinUser } from "b5-api-client";

export function useUser() {
    const [user, setUser] = useState<KioscoinUser | undefined>(undefined);

    const login = (userData: KioscoinUser) => {
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

