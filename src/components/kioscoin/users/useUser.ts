import { useState } from "react";
import { disconnect } from '@wagmi/core'
import { config } from '@/components/web3/wagmi'
import { KioscoinUser } from "b5-api-client";

export function useUser() {
    const [user, setUser] = useState<KioscoinUser | undefined>(undefined);
    const [loginId, setLoginId] = useState<string | undefined>(undefined);
    const login = (userData: KioscoinUser, loginId: string) => {
        setUser(userData);
        setLoginId(loginId);
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
        loginId
    };
}

