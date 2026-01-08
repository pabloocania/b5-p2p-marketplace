"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ValidationError } from "b5-api-client";
import { useTranslation } from "react-i18next";
import { getApiErrorKeyOrDefault } from "@/lib/apiErrorMapper";

export interface ApiError {
  message: string;
  error?: ValidationError;
}

interface ValidationErrorAlertProps {
  error: ApiError | null;
  className?: string;
}

/**
 * Reusable component to display API validation errors.
 * Automatically translates ValidationError codes to user-friendly messages.
 * Falls back to raw message if no error code is present.
 */
export function ValidationErrorAlert({
  error,
  className = "",
}: ValidationErrorAlertProps) {
  const { t } = useTranslation();

  if (!error) {
    return null;
  }

  const errorMessage = error.error
    ? t(getApiErrorKeyOrDefault(error.error))
    : error.message;

  return (
    <Alert
      variant="destructive"
      className={`border-red-500 bg-red-50 ${className} font-secondary text-center p-1 rounded-md`}
    >
      <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
    </Alert>
  );
}
