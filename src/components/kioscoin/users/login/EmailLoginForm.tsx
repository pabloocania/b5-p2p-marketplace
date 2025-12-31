import { useState } from "react";
import { firebaseService } from "../../../../lib/APIClients";
import { FormInput } from "./FormInput";
import { LoadingButton } from "./LoadingButton";
import { ErrorAlert } from "./ErrorAlert";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { KioscoinUser, UserData } from "b5-api-client";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
} from "@web3auth/modal/react";
import { useToast } from "@/components/ui/use-toast";

interface EmailLoginFormProps {
  readonly onLogin: (user: KioscoinUser, userData: UserData) => void;
  readonly onSwitchToRegister?: () => void;
}

export const EmailLoginForm = ({
  onLogin,
  onSwitchToRegister,
}: EmailLoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { toast } = useToast();
  const { loading: connectLoading } = useWeb3AuthConnect();
  const {
    disconnect,
    loading: disconnectLoading,
    error: disconnectError,
  } = useWeb3AuthDisconnect();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    await disconnect();
    console.log("disconnected");
    try {
      const result = await firebaseService.signInWithEmail(email, password);

      if (result.success && result.user && result.userData) {
        onLogin(result.user, result.userData);
      } else {
        setError(t("login_failed"));
      }
    } catch (err: any) {
      setError(err.message || t("unexpected_error_occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError(t("enter_your_email_address"));
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const success = await firebaseService.sendPasswordResetEmail(email);
      if (success) {
        toast({
          title: t("password_reset_sent"),
          description: t("password_reset_sent_description"),
          className: "font-secondary",
        });
      } else {
        setError(t("password_reset_failed"));
      }
    } catch (err: any) {
      setError(t("password_reset_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleEmailLogin} className="space-y-3">
      <ErrorAlert error={error} />

      <FormInput
        type="email"
        placeholder="Email"
        value={email}
        onChange={setEmail}
        required
        disabled={isLoading}
      />

      <FormInput
        type="password"
        placeholder="Password"
        value={password}
        onChange={setPassword}
        required
        disabled={isLoading}
      />

      <LoadingButton
        isLoading={connectLoading}
        loadingText={t("signing_in")}
        buttonText={t("sign_in_with_email")}
        onClick={() => {}}
      />

      <div className="relative py-2">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          {t("or")}
        </span>
      </div>

      <GoogleLoginButton
        onLogin={onLogin}
        onError={setError}
        disabled={isLoading}
      />

      <div className="flex justify-between items-center p-2 gap-4">
        <button
          type="button"
          className="text-xs text-primary hover:underline"
          onClick={handleForgotPassword}
          disabled={isLoading}
        >
          {t("forgot_password")}
        </button>

        {onSwitchToRegister && (
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={onSwitchToRegister}
          >
            {t("register")}
          </button>
        )}
      </div>
    </form>
  );
};
