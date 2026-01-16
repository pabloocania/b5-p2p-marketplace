import { useState, useEffect } from "react";
import { disconnect as wagmiDisconnect } from '@wagmi/core'
import { config } from '@/components/web3/wagmi'
import { KioscoinUser, UserSettings } from "b5-api-client";
import { AUTH_CONNECTION, WALLET_CONNECTORS } from "@web3auth/modal";
import {
    useWeb3AuthConnect,
    useWeb3AuthDisconnect,
    useWeb3Auth
} from "@web3auth/modal/react";
import { UserData } from "b5-api-client";
import { destroyNotificationsService } from "@/lib/NotificationsService";
import { p2pMarketAPIClient as client } from "@/lib/APIClients";

export function useKioscoinUser() {
    const [user, setUser] = useState<KioscoinUser | undefined>(undefined);
    const [loginId, setLoginId] = useState<string | undefined>(undefined);
    const [emailVerified, setEmailVerified] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const {
        connectTo,
        isConnected
    } = useWeb3AuthConnect();
    const {
        disconnect,
    } = useWeb3AuthDisconnect();

    // Clean up stale Web3Auth sessions on mount
    useEffect(() => {
        const cleanupStaleSession = async () => {
            // If Web3Auth is connected but we don't have a user in our app state,
            // disconnect to ensure clean state
            if (isConnected && !user && !isInitialized) {
                try {
                    await wagmiDisconnect(config);
                    await disconnect();
                } catch (error) {
                    console.error('[useKioscoinUser] Error cleaning up stale session:', error);
                }
            }
            setIsInitialized(true);
        };

        cleanupStaleSession();
    }, [isConnected, user, disconnect, isInitialized]);


    const login = async (user: KioscoinUser, userData: UserData) => {
        setUser(user);
        setLoginId(userData.idToken ?? undefined);
        setEmailVerified(userData.isEmailVerified);

        // Always disconnect first to ensure clean state
        // This prevents stale Web3Auth sessions from interfering
        if (isConnected) {
            await disconnect();
            await wagmiDisconnect(config);
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

    const updateUser = (nextUser: KioscoinUser) => {
        setUser(nextUser);
    };

    const mergeUserSettings = (
        user: KioscoinUser,
        settings: UserSettings
    ): KioscoinUser => ({
        ...user,
        settings: {
            ...(user.settings ?? {}),
            ...settings,
        },
    });

    const updateUserSettings = (settings: UserSettings) => {
        setUser((prev) => (prev ? mergeUserSettings(prev, settings) : prev));
    };

    const logout = async () => {
        // Disconnect and destroy WebSocket service
        destroyNotificationsService();

        // Clear session cookie on backend
        try {
            await client.clearSession();
        } catch (error) {
            console.error('[useKioscoinUser] Error clearing session:', error);
        }

        setUser(undefined);
        setLoginId(undefined);
        wagmiDisconnect(config);
        disconnect();
    };

    return {
        user,
        isLoggedIn: !!user,
        login,
        logout,
        loginId,
        emailVerified,
        updateUser,
        updateUserSettings
    };
}

