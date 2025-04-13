import { useState } from "react";
import { firebaseService, AuthResult } from "../../lib/FirebaseUnifiedService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";

interface RegisterFormProps {
  readonly onRegisterSuccess: (result: AuthResult) => void;
  readonly onLoginClick: () => void;
}

interface RegisterFormState {
  readonly email: string;
  readonly password: string;
  readonly username: string;
  readonly error: string | null;
  readonly isLoading: boolean;
}

export function RegisterForm({
  onRegisterSuccess,
  onLoginClick,
}: RegisterFormProps) {
  const [formState, setFormState] = useState<RegisterFormState>({
    email: "",
    password: "",
    username: "",
    error: null,
    isLoading: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await firebaseService.createUserWithEmail(
        formState.email,
        formState.password,
        formState.username
      );

      if (result.success && result.user) {
        onRegisterSuccess(result);
      } else {
        setFormState((prev) => ({
          ...prev,
          error: result.error || "Registration failed",
          isLoading: false,
        }));
      }
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        error: "An unexpected error occurred",
        isLoading: false,
      }));
    }
  };

  const handleInputChange =
    (field: keyof RegisterFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <Input
              id="username"
              type="text"
              required
              value={formState.username}
              onChange={handleInputChange("username")}
              className="mt-1"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <Input
              id="email"
              type="email"
              required
              value={formState.email}
              onChange={handleInputChange("email")}
              className="mt-1"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              value={formState.password}
              onChange={handleInputChange("password")}
              className="mt-1"
              placeholder="Enter your password"
            />
          </div>

          {formState.error && (
            <Alert variant="destructive">
              <AlertDescription>{formState.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-4">
            <Button
              type="submit"
              disabled={formState.isLoading}
              className="w-full"
            >
              {formState.isLoading ? "Creating account..." : "Create account"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onLoginClick}
              className="w-full"
            >
              Already have an account? Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
