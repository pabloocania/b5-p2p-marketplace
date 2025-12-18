import { ActiveView, NavigationParams } from "@/components/kioscoin/NavigationContext";

export interface DeepLinkData {
    view: ActiveView;
    params: NavigationParams;
}

/**
 * Parse deeplink parameters from URL
 * Supports: ?orderId=xxx&view=OrderFeed
 */
export const parseDeepLink = (): DeepLinkData | undefined => {
    if (typeof window === "undefined") return undefined;

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");
    const view = urlParams.get("view") as ActiveView | null;

    if (!orderId) return undefined;

    return {
        view: view === "MyOrders" ? "MyOrders" : "OrderFeed",
        params: {
            orderId,
            showDetails: true,
            isDeeplink: true, // Mark as deeplink to show "Shared order" banner
        },
    };
};

/**
 * Generate a shareable deeplink URL for an order
 */
export const generateOrderShareLink = (orderId: string): string => {
    if (typeof window === "undefined") return "";

    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
        orderId,
        view: "OrderFeed",
    });

    return `${baseUrl}?${params.toString()}`;
};

/**
 * Copy share link to clipboard
 */
export const copyOrderShareLink = async (orderId: string): Promise<boolean> => {
    const link = generateOrderShareLink(orderId);
    try {
        await navigator.clipboard.writeText(link);
        return true;
    } catch {
        return false;
    }
};

/**
 * Share order via native share API (mobile) or fallback to clipboard
 */
export const shareOrder = async (
    orderId: string,
    title?: string,
    text?: string
): Promise<boolean> => {
    const link = generateOrderShareLink(orderId);

    if (typeof navigator !== "undefined" && navigator.share) {
        try {
            await navigator.share({
                title: title ?? "Check out this order",
                text: text ?? "I want to share this order with you",
                url: link,
            });
            return true;
        } catch (error) {
            // User cancelled or share failed, fallback to clipboard
            if ((error as Error).name !== "AbortError") {
                return copyOrderShareLink(orderId);
            }
            return false;
        }
    }

    return copyOrderShareLink(orderId);
};

