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
        <p className="text-base sm:text-lg text-white/90 mb-1 max-w-2xl mx-auto">
          {t("landing_hero_text")}
        </p>

        {/* Features - Much more compressed */}
        <div className="flex flex-wrap justify-center gap-3 mb-1">
          <div className="flex items-center text-white/90">
            <span className="text-lg mr-1">🔒</span>
            <span className="text-xs">{t("secure_escrow")}</span>
          </div>
          <div className="flex items-center text-white/90">
            <span className="text-lg mr-1">⚡</span>
            <span className="text-xs">{t("instant_trading")}</span>
          </div>
          <div className="flex items-center text-white/90">
            <span className="text-lg mr-1">💰</span>
            <span className="text-xs">{t("no_gas_fees")}</span>
          </div>
        </div>
      </div>

      {/* Auth Section - More compact */}
      <div className="max-w-sm mx-auto px-4 pb-64">
        <div className="bg-white rounded-xl shadow-lg p-3">
          {/* Toggle Buttons - More compact */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 mb-2">
            <button
              onClick={() => setAuthMode("login")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200",
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
                "flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200",
                authMode === "register"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {t("register")}
            </button>
          </div>

          {/* Form - More compact */}
          <div className="min-h-[150px]">
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

      {/* Social Proof - More compact */}
      <div className="text-center py-1 px-4">
        <div className="flex justify-center gap-6 text-white/80 text-xs">
          <div className="text-center">
            <div className="text-lg font-bold text-white">10,000+</div>
            <div>{t("active_users")}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">$2M+</div>
            <div>{t("trading_volume")}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">99.9%</div>
            <div>{t("success_rate")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
