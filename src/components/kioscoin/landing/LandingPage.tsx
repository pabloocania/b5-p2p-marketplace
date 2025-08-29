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
    <div className="min-h-screen bg-lightYellow/30 flex flex-col -mt-14 pt-14">
      {/* Hero Section - Compact */}
      <div className="text-center py-4 px-4">
        <div className="flex justify-center mb-6">
          <img
            src="/icons/kioscoin-logotipo-lila.png"
            alt="Kioscoin"
            className="h-32 sm:h-40 md:h-48 w-auto object-contain"
          />
        </div>

        {/* Features - Compact */}
        <div className="flex flex-wrap justify-center gap-3 mb-3">
          <div className="flex items-center text-dark">
            <span className="text-base mr-1">🔒</span>
            <span className="text-xs">{t("secure_escrow")}</span>
          </div>
          <div className="flex items-center text-dark">
            <span className="text-base mr-1">⚡</span>
            <span className="text-xs">{t("instant_trading")}</span>
          </div>
          <div className="flex items-center text-dark">
            <span className="text-base mr-1">💰</span>
            <span className="text-xs">{t("no_gas_fees")}</span>
          </div>
        </div>

        {/* Social Proof - Modern Cards */}
        <div className="flex justify-center gap-3 sm:gap-4 mb-4">
          <div className="border-2 border-dashed border-purple-300 bg-purple-50/80 rounded-lg p-1 sm:p-1.5 text-center min-w-[100px] sm:min-w-[120px] hover:bg-purple-100/80 transition-colors">
            <div className="text-purple-600 text-sm sm:text-base mb-0.5">
              👥
            </div>
            <div className="text-gray-800 text-xs sm:text-sm font-bold">
              10,000+
            </div>
            <div className="text-gray-600 text-[10px]">{t("active_users")}</div>
          </div>

          <div className="border-2 border-dashed border-purple-300 bg-purple-50/80 rounded-lg p-1 sm:p-1.5 text-center min-w-[100px] sm:min-w-[120px] hover:bg-purple-100/80 transition-colors">
            <div className="text-purple-600 text-sm sm:text-base mb-0.5">
              📊
            </div>
            <div className="text-gray-800 text-xs sm:text-sm font-bold">
              $2M+
            </div>
            <div className="text-gray-600 text-[10px]">
              {t("trading_volume")}
            </div>
          </div>

          <div className="border-2 border-dashed border-purple-300 bg-purple-50/80 rounded-lg p-1 sm:p-1.5 text-center min-w-[100px] sm:min-w-[120px] hover:bg-purple-100/80 transition-colors">
            <div className="text-purple-600 text-sm sm:text-base mb-0.5">
              ✅
            </div>
            <div className="text-gray-800 text-xs sm:text-sm font-bold">
              99.9%
            </div>
            <div className="text-gray-600 text-[10px]">{t("success_rate")}</div>
          </div>
        </div>
      </div>

      {/* Auth Section - Compact size */}
      <div className="flex-1 max-w-md mx-auto px-4 pb-6">
        <div className="bg-white rounded-xl shadow-lg p-4">
          {/* Toggle Buttons - Compact */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-3">
            <button
              onClick={() => setAuthMode("login")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200 font-donatto",
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
                "flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200 font-donatto",
                authMode === "register"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {t("register")}
            </button>
          </div>

          {/* Form - Compact size */}
          <div className="min-h-[180px]">
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
    </div>
  );
}
