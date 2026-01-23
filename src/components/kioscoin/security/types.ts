/**
 * Security module types and interfaces
 * Provides type definitions for wallet security operations
 */

/** State machine for the export private key flow */
export type ExportKeyStep = "confirmation" | "revealed" | "closed";

/** Props for the ExportPrivateKey component */
export interface ExportPrivateKeyProps {
    readonly className?: string;
}

/** Internal state for the private key export dialog */
export interface ExportKeyState {
    readonly step: ExportKeyStep;
    readonly isLoading: boolean;
    readonly error: string | null;
}

/** Result of attempting to export the private key */
export interface ExportKeyResult {
    readonly success: boolean;
    readonly key?: string;
    readonly error?: string;
}

/** Configuration for security warnings */
export interface SecurityWarning {
    readonly titleKey: string;
    readonly messageKey: string;
    readonly variant: "destructive" | "warning";
}

