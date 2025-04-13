import { useState } from "react";
import { useRouter } from "next/router";
import { LoginForm } from "../../components/auth/LoginForm";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { ForgotPasswordForm } from "../../components/auth/ForgotPasswordForm";
import { SocialLogin } from "../../components/auth/SocialLogin";
import { EmailLinkAuthForm } from "../../components/auth/EmailLinkAuthForm";
import { AuthResult } from "../../lib/FirebaseAuthService";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";

type AuthView = "login" | "register" | "forgot-password" | "email-link";

export default function AuthPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<AuthView>("login");

  const handleLoginSuccess = (userData: AuthResult) => {
    // Redirect to dashboard or home page after successful login
    router.push("/dashboard");
  };

  const handleRegisterSuccess = (userData: AuthResult) => {
    // Redirect to dashboard or home page after successful registration
    router.push("/dashboard");
  };

  const renderAuthForm = () => {
    switch (currentView) {
      case "login":
        return (
          <>
            <SocialLogin onLoginSuccess={handleLoginSuccess} />
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onRegisterClick={() => setCurrentView("register")}
              onForgotPasswordClick={() => setCurrentView("forgot-password")}
              onEmailLinkClick={() => setCurrentView("email-link")}
            />
          </>
        );
      case "register":
        return (
          <>
            <div className="mb-4">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => setCurrentView("login")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </div>
            <RegisterForm
              onRegisterSuccess={handleRegisterSuccess}
              onLoginClick={() => setCurrentView("login")}
            />
          </>
        );
      case "forgot-password":
        return (
          <>
            <div className="mb-4">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => setCurrentView("login")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </div>
            <ForgotPasswordForm onBackToLogin={() => setCurrentView("login")} />
          </>
        );
      case "email-link":
        return (
          <>
            <div className="mb-4">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => setCurrentView("login")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </div>
            <EmailLinkAuthForm
              onLoginSuccess={handleLoginSuccess}
              onBackToLogin={() => setCurrentView("login")}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Kioscoin</h1>
          <p className="mt-2 text-sm text-gray-600">
            {currentView === "login" && "Sign in to your account"}
            {currentView === "register" && "Create a new account"}
            {currentView === "forgot-password" && "Reset your password"}
            {currentView === "email-link" && "Sign in with email link"}
          </p>
        </div>
        {renderAuthForm()}
      </div>
    </div>
  );
}
