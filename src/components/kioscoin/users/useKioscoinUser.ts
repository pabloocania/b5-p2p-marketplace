import { useState } from "react";
import { disconnect as wagmiDisconnect } from '@wagmi/core'
import { config } from '@/components/web3/wagmi'
import { KioscoinUser } from "b5-api-client";
import { AUTH_CONNECTION, WALLET_CONNECTORS } from "@web3auth/modal";
import {
    useWeb3AuthConnect,
    useWeb3AuthDisconnect,
    useWeb3Auth
} from "@web3auth/modal/react";
import { UserData } from "b5-api-client";

export function useKioscoinUser() {
    const [user, setUser] = useState<KioscoinUser | undefined>(undefined);
    const [loginId, setLoginId] = useState<string | undefined>(undefined);
    const [emailVerified, setEmailVerified] = useState<boolean>(false);
    const {
        connectTo,
        isConnected,
        connectorName,
    } = useWeb3AuthConnect();
    const {
        disconnect,
    } = useWeb3AuthDisconnect();
    const { provider } = useWeb3Auth();


    const login = async (user: KioscoinUser, userData: UserData) => {
        setUser(user);
        setLoginId(userData.idToken ?? undefined);
        setEmailVerified(userData.isEmailVerified);

        // Check if wallet is actually connected AND has a provider
        // Provider is null if web3auth persisted state but didn't reconnect
        const alreadyConnected = isConnected && connectorName === WALLET_CONNECTORS.AUTH && provider !== null;
        if (alreadyConnected) {
            console.log('[useKioscoinUser] Already connected with valid provider, skipping reconnection');
            return;
        }

        try {
            await connectTo(WALLET_CONNECTORS.AUTH, {
                authConnectionId: "b5-kioscoin-dev",
                authConnection: AUTH_CONNECTION.CUSTOM,
                idToken: userData.idToken ?? undefined,
                extraLoginOptions: {
                    isUserIdCaseSensitive: true,
                },
            });
        } catch (error: any) {
            throw error;
        }
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
        loginId,
        emailVerified
    };
}

