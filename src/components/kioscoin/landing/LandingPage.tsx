"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmailLoginForm } from "@/components/kioscoin/users/login/EmailLoginForm";
import { RegisterForm } from "@/components/kioscoin/users/login/RegisterForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/components/kioscoin/users/UserContext";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Shield,
  Zap,
  DollarSign,
} from "lucide-react";

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
    <div className="min-h-screen flex flex-col -mt-14 pt-12">
      {/* Full-viewport background layer */}
      <div className="fixed inset-0 bg-terciary -z-10"></div>
      {/* Hero Section - Compact */}
      <div className="text-center py-4 px-4">
        <div className="flex justify-center mb-6">
          <img
            src="/icons/kioscoin-logotipo-lila.png"
            alt="Kioscoin"
            className="w-auto object-contain"
          />
        </div>

        {/* Features - Compact */}
        <div
          className="flex flex-wrap justify-center gap-3 mb-8 font-primary"
          style={{ marginTop: "-1cm" }}
        >
          <div className="flex items-center text-gray-700">
            <Shield className="h-4 w-4 mr-1 text-primary/80" />
            <span className="text-xs font-medium">{t("secure_escrow")}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Zap className="h-4 w-4 mr-1 text-secondary" />
            <span className="text-xs font-medium">{t("instant_trading")}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-xs font-medium">{t("no_gas_fees")}</span>
          </div>
        </div>

        {/* Social Proof - Modern Cards */}
        <div
          className="flex justify-center gap-3 sm:gap-4 mb-5 font-primary"
          style={{ marginTop: "1cm" }}
        >
          <div className="border border-purple-200 bg-white/80 rounded-xl p-2 sm:p-3 text-center min-w-[110px] sm:min-w-[130px] shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-center mb-1">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary/80" />
            </div>
            <div className="text-gray-500 text-sm sm:text-base font-bold leading-tight">
              10,000+
            </div>
            <div className="text-gray-600 text-[10px] sm:text-xs">Usuarios</div>
          </div>

          <div className="border border-purple-200 bg-white/80 rounded-xl p-2 sm:p-3 text-center min-w-[110px] sm:min-w-[130px] shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-center mb-1">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
            </div>
            <div className="text-gray-500 text-sm sm:text-base font-bold leading-tight">
              $2M+
            </div>
            <div className="text-gray-600 text-[10px] sm:text-xs">Volumen</div>
          </div>

          <div className="border border-purple-200 bg-white/80 rounded-xl p-2 sm:p-3 text-center min-w-[110px] sm:min-w-[130px] shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-center mb-1">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
            <div className="text-gray-500 text-sm sm:text-base font-bold leading-tight">
              99.9%
            </div>
            <div className="text-gray-600 text-[10px] sm:text-xs">
              Tasa de Éxito
            </div>
          </div>
        </div>
      </div>

      {/* Auth Section - Compact size */}
      <div className="flex-1 max-w-lg mx-auto px-4 pb-6">
        <div
          className={cn(
            "bg-white rounded-xl shadow-lg p-4 font-secondary transform transition-transform duration-200 origin-top",
            authMode === "login" ? "scale-[1.15]" : "scale-100"
          )}
        >
          {/* Toggle Buttons - Compact */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-3">
            <button
              onClick={() => setAuthMode("login")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200 font-secondary",
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
                "flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200 font-secondary",
                authMode === "register"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {t("register")}
            </button>
          </div>

          {/* Form - compact height */}
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
