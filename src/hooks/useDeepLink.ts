import { useEffect, useState } from "react";
import { useNavigation } from "@/components/kioscoin/NavigationContext";
import { parseDeepLink, DeepLinkData } from "@/lib/deeplink";
import { KioscoinUser } from "b5-api-client";

interface UseDeepLinkResult {
    requiresLogin: boolean;
    deepLinkData: DeepLinkData | undefined;
}

/**
 * Hook to handle deeplink navigation
 * - If user is logged in: navigates immediately
 * - If user is not logged in: stores pending navigation and signals login is required
 */
export const useDeepLink = (user: KioscoinUser | undefined): UseDeepLinkResult => {
    const { navigate, setPendingNavigation, executePendingNavigation, pendingNavigation } = useNavigation();
    const [deepLinkData, setDeepLinkData] = useState<DeepLinkData | undefined>(undefined);
    const [requiresLogin, setRequiresLogin] = useState(false);
    const [hasProcessed, setHasProcessed] = useState(false);

    // Parse deeplink on mount
    useEffect(() => {
        if (hasProcessed) return;

        const data = parseDeepLink();
        if (data) {
            setDeepLinkData(data);
            setHasProcessed(true);

            if (user) {
                // User is logged in, navigate immediately
                navigate(data.view, data.params);
                // Clean URL
                if (typeof window !== "undefined") {
                    window.history.replaceState({}, "", window.location.pathname);
                }
            } else {
                // User not logged in, store pending navigation
                setPendingNavigation({ view: data.view, params: data.params });
                setRequiresLogin(true);
            }
        }
    }, [hasProcessed, user, navigate, setPendingNavigation]);

    // Execute pending navigation when user logs in
    useEffect(() => {
        if (user && pendingNavigation) {
            executePendingNavigation();
            setRequiresLogin(false);
        }
    }, [user, pendingNavigation, executePendingNavigation]);

    return { requiresLogin, deepLinkData };
};

