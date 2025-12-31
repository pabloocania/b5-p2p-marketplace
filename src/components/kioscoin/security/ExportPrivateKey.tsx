"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Key,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { usePrivateKeyExport } from "./usePrivateKeyExport";
import type {
  ExportPrivateKeyProps,
  ExportKeyState,
  ExportKeyStep,
} from "./types";

/** Confirmation phrase the user must type */
const CONFIRMATION_PHRASE = "I UNDERSTAND";

/** Time in ms before auto-hiding the key (security measure) */
const AUTO_HIDE_TIMEOUT_MS = 60_000; // 1 minute

/**
 * Creates initial state for the export key flow
 */
const createInitialState = (): ExportKeyState => ({
  step: "confirmation",
  isLoading: false,
  error: null,
});

/**
 * State transition helpers - immutable updates
 */
const withStep = (
  state: ExportKeyState,
  step: ExportKeyStep
): ExportKeyState => ({
  ...state,
  step,
  error: null,
});

const withLoading = (
  state: ExportKeyState,
  isLoading: boolean
): ExportKeyState => ({
  ...state,
  isLoading,
});

const withError = (state: ExportKeyState, error: string): ExportKeyState => ({
  ...state,
  error,
  isLoading: false,
});

/**
 * ExportPrivateKey Component
 *
 * Provides a secure UI for users to export their EOA private key.
 * Implements multiple security measures:
 * - Requires explicit user confirmation
 * - Key is not stored in component state
 * - Auto-hides after timeout
 * - Clears key from memory on close
 */
export default function ExportPrivateKey({ className }: ExportPrivateKeyProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { exportKey, clearKey, copyToClipboard, isConnected } =
    usePrivateKeyExport();

  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<ExportKeyState>(createInitialState);

  // Security-sensitive values kept in refs, not state
  const [confirmText, setConfirmText] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const privateKeyRef = useRef<string | null>(null);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Computed values
  const isConfirmed = confirmText.toUpperCase() === CONFIRMATION_PHRASE;

  /**
   * Clears all sensitive data and resets state
   */
  const resetState = useCallback(() => {
    privateKeyRef.current = null;
    clearKey();
    setState(createInitialState());
    setConfirmText("");
    setShowKey(false);
    setCopied(false);

    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, [clearKey]);

  /**
   * Handles dialog open/close
   */
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        resetState();
      }
      setIsOpen(open);
    },
    [resetState]
  );

  /**
   * Handles the export key action
   */
  const handleExportKey = useCallback(async () => {
    if (!isConfirmed) return;

    setState((s) => withLoading(s, true));

    const result = await exportKey();

    if (result.success && result.key) {
      privateKeyRef.current = result.key;
      setState((s) => withStep(withLoading(s, false), "revealed"));

      // Auto-hide timer for security
      autoHideTimerRef.current = setTimeout(() => {
        setShowKey(false);
        toast({
          title: t("security.key_auto_hidden"),
          description: t("security.key_auto_hidden_desc"),
          className: "font-secondary",
        });
      }, AUTO_HIDE_TIMEOUT_MS);
    } else {
      setState((s) => withError(s, result.error || "export_failed"));
      toast({
        title: t("error"),
        description: t(`security.${result.error}`),
        variant: "destructive",
        className: "font-secondary",
      });
    }
  }, [isConfirmed, exportKey, toast, t]);

  /**
   * Handles copying the key to clipboard
   */
  const handleCopy = useCallback(async () => {
    if (!privateKeyRef.current) return;

    const success = await copyToClipboard(privateKeyRef.current);

    if (success) {
      setCopied(true);
      toast({
        title: t("copied"),
        description: t("security.key_copied"),
        className: "font-secondary",
      });

      // Reset copy indicator after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: t("error"),
        description: t("security.copy_failed"),
        variant: "destructive",
        className: "font-secondary",
      });
    }
  }, [copyToClipboard, toast, t]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current);
      }
      privateKeyRef.current = null;
    };
  }, []);

  // Don't render if wallet is not connected
  if (!isConnected) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex font-secondary w-full items-center gap-2 text-xs border-primary text-dark hover:bg-terciary ${className}`}
        >
          <Key className="h-3 w-3" />
          {t("security.export_private_key")}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-dark font-secondary">
            <Shield className="h-5 w-5" />
            {t("security.export_private_key")}
          </DialogTitle>
          {/* <DialogDescription className="text-sm font-secondary text-primary">
            {t("security.export_description")}
          </DialogDescription> */}
        </DialogHeader>

        {/* Security Warning - Always visible */}
        <Alert className="bg-secondary/10 border-secondary/20">
          <AlertTriangle className="h-4 w-4 text-dark" />
          <AlertDescription className="text-xs font-secondary text-dark">
            {t("security.warning_message")}
          </AlertDescription>
        </Alert>

        {state.step === "confirmation" && (
          <ConfirmationStep
            confirmText={confirmText}
            onConfirmTextChange={setConfirmText}
            onExport={handleExportKey}
            isLoading={state.isLoading}
            isConfirmed={isConfirmed}
            t={t}
          />
        )}

        {state.step === "revealed" && (
          <RevealedKeyStep
            privateKey={privateKeyRef.current || ""}
            showKey={showKey}
            onToggleShow={() => setShowKey((s) => !s)}
            onCopy={handleCopy}
            copied={copied}
            t={t}
          />
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="font-secondary w-full items-center gap-2 text-xs border-primary text-dark hover:bg-terciary"
          >
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Confirmation step - user must type confirmation phrase
 */
interface ConfirmationStepProps {
  readonly confirmText: string;
  readonly onConfirmTextChange: (value: string) => void;
  readonly onExport: () => void;
  readonly isLoading: boolean;
  readonly isConfirmed: boolean;
  readonly t: (key: string) => string;
}

function ConfirmationStep({
  confirmText,
  onConfirmTextChange,
  onExport,
  isLoading,
  isConfirmed,
  t,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-secondary text-dark font-bold">
          {t("security.type_to_confirm")}
        </p>
        <p className="text-sm font-mono bg-secondary/10 p-2 rounded text-center text-dark">
          {CONFIRMATION_PHRASE}
        </p>
      </div>

      <Input
        value={confirmText}
        onChange={(e) => onConfirmTextChange(e.target.value)}
        placeholder={t("security.type_confirmation")}
        className="font-mono font-secondary"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      <Button
        onClick={onExport}
        disabled={!isConfirmed || isLoading}
        className="font-secondary w-full items-center gap-2 text-xs border-primary text-dark hover:bg-terciary disabled:opacity-50"
        variant="outline"
      >
        {isLoading ? t("security.exporting") : t("security.show_key")}
      </Button>
    </div>
  );
}

/**
 * Revealed key step - shows the private key with copy functionality
 */
interface RevealedKeyStepProps {
  readonly privateKey: string;
  readonly showKey: boolean;
  readonly onToggleShow: () => void;
  readonly onCopy: () => void;
  readonly copied: boolean;
  readonly t: (key: string) => string;
}

function RevealedKeyStep({
  privateKey,
  showKey,
  onToggleShow,
  onCopy,
  copied,
  t,
}: RevealedKeyStepProps) {
  const maskedKey = "•".repeat(64);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          value={showKey ? privateKey : maskedKey}
          readOnly
          className="pr-20 font-mono text-xs text-dark"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-dark hover:bg-terciary"
            onClick={onToggleShow}
            title={showKey ? t("security.hide_key") : t("security.show_key")}
          >
            {showKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-dark hover:bg-terciary"
            onClick={onCopy}
            title={t("copy")}
          >
            {copied ? (
              <Check className="h-4 w-4 text-secondary" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Alert className="bg-primary/10 border-primary/20">
        <AlertDescription className="text-xs font-secondary text-dark">
          {t("security.save_securely")}
        </AlertDescription>
      </Alert>
    </div>
  );
}
