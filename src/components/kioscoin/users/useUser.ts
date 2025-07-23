import { useState } from "react";
import { disconnect as wagmiDisconnect } from '@wagmi/core'
import { config } from '@/components/web3/wagmi'
import { KioscoinUser } from "b5-api-client";
import { AUTH_CONNECTION, WALLET_CONNECTORS } from "@web3auth/modal";
import {
    useWeb3AuthConnect,
    useWeb3AuthDisconnect,
    useWeb3AuthUser,
    useManageMFA,
    useEnableMFA,
} from "@web3auth/modal/react";

export function useUser() {
    const [user, setUser] = useState<KioscoinUser | undefined>(undefined);
    const [loginId, setLoginId] = useState<string | undefined>(undefined);
    const {
        connectTo,
        isConnected,
        connectorName,
        loading: connectLoading,
        error: connectError,
    } = useWeb3AuthConnect();
    const {
        disconnect,
        loading: disconnectLoading,
        error: disconnectError,
    } = useWeb3AuthDisconnect();


    const login = async (userData: KioscoinUser, loginId: string) => {
        const provider = await connectTo(WALLET_CONNECTORS.AUTH, {
            authConnectionId: "b5-kioscoin-dev",
            authConnection: AUTH_CONNECTION.CUSTOM,
            idToken: loginId,
            extraLoginOptions: {
                isUserIdCaseSensitive: true,
            },
        })
        console.log("provider", provider);
        setUser(userData);
        setLoginId(loginId);
    };

    const logout = () => {
        setUser(undefined);
        wagmiDisconnect(config);
        disconnect();
    };

    return {
        user,
        isLoggedIn: !!user,
        login,
        logout,
        loginId
    };
}

