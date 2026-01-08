import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LoadingButtonProps } from "./types";

export const LoadingButton = ({
  isLoading,
  loadingText,
  buttonText,
  onClick,
  disabled = false,
}: LoadingButtonProps) => (
  <Button
    type="submit"
    className="w-full text-white bg-primary text-xs font-medium"
    disabled={isLoading || disabled}
    onClick={onClick}
  >
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingText}
      </>
    ) : (
      buttonText
    )}
  </Button>
);
