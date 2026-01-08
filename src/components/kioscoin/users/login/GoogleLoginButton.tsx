import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { firebaseService } from "../../../../lib/APIClients";
import { KioscoinUser, UserData } from "b5-api-client";
import { GoogleIcon } from "../../../../icons/GoogleIcon";

interface GoogleLoginButtonProps {
  readonly onLogin: (user: KioscoinUser, userData: UserData) => void;
  readonly onError: (error: string) => void;
  readonly disabled?: boolean;
}

export const GoogleLoginButton = ({
  onLogin,
  onError,
  disabled = false,
}: GoogleLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await firebaseService.signInWithGoogle();
      if (result.success && result.user && result.userData) {
        onLogin(result.user, result.userData);
      } else {
        onError(result.error || t("google_login_failed"));
      }
    } catch (err: any) {
      onError(err.message || t("unexpected_error_occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="flex font-secondary w-full items-center gap-1 text-xs border-primary text-dark hover:bg-terciary"
      onClick={handleGoogleLogin}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <GoogleIcon className="h-4 w-4 mr-2" />
          {t("security.sign_in_with_google")}
        </>
      )}
    </Button>
  );
};
