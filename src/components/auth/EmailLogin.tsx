import React, { useState } from "react";
import { firebaseAuthService } from "../../lib/FirebaseAuthService";
import { EmailOTPVerification } from "./EmailOTPVerification";

interface EmailLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const EmailLogin: React.FC<EmailLoginProps> = ({
  onLoginSuccess,
  onCancel,
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTPVerification, setShowOTPVerification] =
    useState<boolean>(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, try to sign in with email and password
      const user = await firebaseAuthService.signInWithEmail(email, password);

      if (user) {
        // If the user exists, proceed with OTP verification
        setShowOTPVerification(true);
        setIsNewUser(false);
      } else {
        // If the user doesn't exist, create a new account
        const newUser = await firebaseAuthService.createUserWithEmail(
          email,
          password,
          email.split("@")[0]
        );

        if (newUser) {
          setShowOTPVerification(true);
          setIsNewUser(true);
        } else {
          setError("Failed to create account. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerificationComplete = async (success: boolean) => {
    if (success) {
      if (isNewUser) {
        // For new users, send email verification
        await firebaseAuthService.sendEmailVerification();
      }
      onLoginSuccess();
    } else {
      setError("OTP verification failed. Please try again.");
      setShowOTPVerification(false);
    }
  };

  const handleCancelOTP = () => {
    setShowOTPVerification(false);
  };

  if (showOTPVerification) {
    return (
      <EmailOTPVerification
        email={email}
        onVerificationComplete={handleOTPVerificationComplete}
        onCancel={handleCancelOTP}
      />
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-center">Email Login</h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Login"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="text-center">
        <button
          onClick={() => firebaseAuthService.sendPasswordResetEmail(email)}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={!email || isLoading}
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
};
