import { useState } from "react";
import { firebaseService } from "../../../../lib/APIClients";
import { RegisterFormState } from "./types";
import { FormInput } from "./FormInput";
import { EmailInputWithUsername } from "./EmailInputWithUsername";
import { LoadingButton } from "./LoadingButton";
import { ErrorAlert } from "./ErrorAlert";
import { useTranslation } from "react-i18next";
import { KioscoinUser, UserData } from "b5-api-client";

interface RegisterFormProps {
  readonly onLogin: (user: KioscoinUser, userData: UserData) => void;
  readonly onSwitchToEmailLogin: () => void;
}

export const RegisterForm = ({
  onLogin,
  onSwitchToEmailLogin,
}: RegisterFormProps) => {
  const { t } = useTranslation();
  const [registerForm, setRegisterForm] = useState<RegisterFormState>({
    email: "",
    password: "",
    username: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update register form field
  const updateRegisterFormField = (
    field: keyof RegisterFormState,
    value: string
  ) => {
    setRegisterForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate password strength
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return t("password_too_short");
    }

    // Check for at least 1 special character
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    if (!specialCharRegex.test(password)) {
      return t("password_must_contain_special_character");
    }

    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password strength
    const passwordError = validatePassword(registerForm.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Validate passwords match
    if (registerForm.password !== confirmPassword) {
      setError(t("passwords_do_not_match"));
      return;
    }

    setIsLoading(true);

    try {
      const result = await firebaseService.createUserWithEmail(
        registerForm.email,
        registerForm.password,
        registerForm.username
      );

      if (result.success && result.user && result.userData) {
        onLogin(result.user, result.userData);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-3">
      <ErrorAlert error={error} />

      <EmailInputWithUsername
        email={registerForm.email}
        onEmailChange={(email) => updateRegisterFormField("email", email)}
        onUsernameChange={(username) =>
          updateRegisterFormField("username", username)
        }
        disabled={isLoading}
      />

      <FormInput
        type="text"
        placeholder={t("username")}
        value={registerForm.username}
        onChange={(value) => updateRegisterFormField("username", value)}
        required
        disabled={isLoading}
      />

      <FormInput
        type="password"
        placeholder="Password"
        value={registerForm.password}
        onChange={(value) => updateRegisterFormField("password", value)}
        required
        disabled={isLoading}
      />

      <FormInput
        type="password"
        placeholder={t("confirm_password")}
        value={confirmPassword}
        onChange={setConfirmPassword}
        required
        disabled={isLoading}
      />

      <LoadingButton
        isLoading={isLoading}
        loadingText={t("creating_account")}
        buttonText={t("create_account")}
        onClick={() => {}}
      />

      <button
        type="button"
        className="text-xs text-primary hover:underline w-full text-center"
        onClick={onSwitchToEmailLogin}
        disabled={isLoading}
      >
        {t("already_have_account")}
      </button>
    </form>
  );
};
