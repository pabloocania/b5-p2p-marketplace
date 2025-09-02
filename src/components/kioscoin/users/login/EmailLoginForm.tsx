import { useState } from "react";
import { firebaseService } from "../../../../lib/FirebaseUnifiedService";
import { FormInput } from "./FormInput";
import { LoadingButton } from "./LoadingButton";
import { ErrorAlert } from "./ErrorAlert";
import { useTranslation } from "react-i18next";
import { KioscoinUser } from "b5-api-client";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
} from "@web3auth/modal/react";

interface EmailLoginFormProps {
  readonly onLogin: (user: KioscoinUser, token: string) => void;
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

      if (
        result.success &&
        result.user &&
        result.userData &&
        result.userData.idToken
      ) {
        onLogin(result.user, result.userData.idToken);
      } else {
        setError(result.error || t("login_failed"));
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
      await firebaseService.sendPasswordResetEmail(email);
      setError("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email");
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
