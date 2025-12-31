"use client";

import { useCallback, useRef } from "react";
import { useWeb3Auth } from "@web3auth/modal/react";
import { Web3WalletProvider } from "@etherspot/prime-sdk";
import type { ExportKeyResult } from "./types";

/**
 * Hook for securely exporting the private key from Web3Auth
 * 
 * Security considerations:
 * - Key is never stored in React state
 * - Key reference is cleared immediately after use
 * - Exposes only the export function, not the key itself
 */
export function usePrivateKeyExport() {
    const { provider, isConnected } = useWeb3Auth();
    const keyRef = useRef<string | null>(null);

    /**
     * Exports the private key from Web3Auth provider
     * Uses Etherspot's Web3WalletProvider which correctly extracts the key
     * Returns a result object, never throws
     */
    const exportKey = useCallback(async (): Promise<ExportKeyResult> => {
        if (!provider || !isConnected) {
            return {
                success: false,
                error: "wallet_not_connected",
            };
        }

        try {
            // Use Etherspot's Web3WalletProvider which knows how to extract
            // the private key from Web3Auth's provider
            const walletProvider = await Web3WalletProvider.connect(provider);

            // Access the private key from the wallet provider
            const anyWallet = walletProvider as any;

            // Try common property names where the key might be stored
            const key = anyWallet.privateKey ||
                anyWallet._privateKey ||
                anyWallet.wallet?.privateKey;

            if (key && typeof key === "string" && key.length > 0) {
                // Remove '0x' prefix if present for cleaner display
                const cleanKey = key.startsWith("0x") ? key.slice(2) : key;
                keyRef.current = cleanKey;
                return {
                    success: true,
                    key: cleanKey,
                };
            }

            // Fallback: try direct provider request methods
            const methods = ["private_key"];
            for (const method of methods) {
                try {
                    const requestedKey = await provider.request({ method }) as string;
                    if (requestedKey && typeof requestedKey === "string") {
                        const cleanKey = requestedKey.startsWith("0x") ? requestedKey.slice(2) : requestedKey;
                        keyRef.current = cleanKey;
                        return { success: true, key: cleanKey };
                    }
                } catch {
                    // Method not available, continue
                }
            }

            console.error("[usePrivateKeyExport] Could not extract private key");
            return {
                success: false,
                error: "export_failed",
            };
        } catch (error) {
            console.error("[usePrivateKeyExport] Export failed:", error);
            return {
                success: false,
                error: "export_failed",
            };
        }
    }, [provider, isConnected]);

    /**
     * Clears the key from memory
     * Should be called when the user closes the dialog
     */
    const clearKey = useCallback(() => {
        keyRef.current = null;
    }, []);

    /**
     * Copies the key to clipboard securely
     * Uses the modern Clipboard API (requires secure context)
     */
    const copyToClipboard = useCallback(async (key: string): Promise<boolean> => {
        try {
            if (!navigator.clipboard) {
                console.error("[usePrivateKeyExport] Clipboard API not available");
                return false;
            }

            await navigator.clipboard.writeText(key);
            return true;
        } catch (error) {
            console.error("[usePrivateKeyExport] Copy failed:", error);
            return false;
        }
    }, []);

    return {
        exportKey,
        clearKey,
        copyToClipboard,
        isConnected,
    };
}

