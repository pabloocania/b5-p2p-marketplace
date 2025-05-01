import { Alert, AlertDescription } from "@/components/ui/alert";
import { ErrorAlertProps } from "./types";

export const ErrorAlert = ({ error }: ErrorAlertProps) => {
  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};
