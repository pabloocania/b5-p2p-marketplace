"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmailLoginForm } from "@/components/kioscoin/users/login/EmailLoginForm";
import { RegisterForm } from "@/components/kioscoin/users/login/RegisterForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/components/kioscoin/users/UserContext";

export function LandingPage() {
  const { t } = useTranslation();
  const { login } = useUserContext();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleLogin = (user: any, token: string) => {
    // Use the real login function from UserContext
    login(user, token);
  };

  const handleSwitchToRegister = () => {
    setAuthMode("register");
  };

  const handleSwitchToLogin = () => {
    setAuthMode("login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-yellow-500 flex flex-col">
      {/* Hero Section - Much more compressed */}
      <div className="text-center py-1 px-4 flex-1 flex flex-col justify-center">
        <p className="text-lg sm:text-xl text-white/90 mb-1 max-w-2xl mx-auto">
          The future of P2P crypto trading. Buy and sell stablecoins with real
          people, using secure and decentralized escrow.
        </p>

        {/* Features - Much more compressed */}
        <div className="flex flex-wrap justify-center gap-4 mb-1">
          <div className="flex items-center text-white/90">
            <span className="text-xl mr-2">🔒</span>
            <span className="text-sm">Secure Escrow</span>
          </div>
          <div className="flex items-center text-white/90">
            <span className="text-xl mr-2">⚡</span>
            <span className="text-sm">Instant Trading</span>
          </div>
          <div className="flex items-center text-white/90">
            <span className="text-xl mr-2">💰</span>
            <span className="text-sm">No Gas Fees</span>
          </div>
        </div>
      </div>

      {/* Auth Section - Moved much higher */}
      <div className="max-w-md mx-auto px-4 pb-64">
        <div className="bg-white rounded-2xl shadow-2xl p-4">
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-3">
            <button
              onClick={() => setAuthMode("login")}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
                authMode === "login"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {t("login")}
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
                authMode === "register"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {t("register")}
            </button>
          </div>

          {/* Form */}
          <div className="min-h-[200px]">
            {authMode === "login" ? (
              <EmailLoginForm
                onLogin={handleLogin}
                onSwitchToRegister={handleSwitchToRegister}
              />
            ) : (
              <RegisterForm
                onLogin={handleLogin}
                onSwitchToEmailLogin={handleSwitchToLogin}
              />
            )}
          </div>
        </div>
      </div>

      {/* Social Proof - Much more compressed */}
      <div className="text-center py-1 px-4">
        <div className="flex justify-center gap-8 text-white/80 text-sm">
          <div className="text-center">
            <div className="text-xl font-bold text-white">10,000+</div>
            <div>Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">$2M+</div>
            <div>Trading Volume</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">99.9%</div>
            <div>Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
