"use client";
import { useEffect, useRef, useState } from "react";
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

  const [verbIndex, setVerbIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsFading(true);
      timeoutRef.current = setTimeout(() => {
        setVerbIndex((v) => (v === 0 ? 1 : 0));
        setIsFading(false);
      }, 200);
    }, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  const currentVerb = t(
    verbIndex === 0 ? "buy_rioplatense" : "sell_rioplatense"
  );

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
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col gap-5 text-center py-1 px-1">
        <div className="flex justify-center">
          <img
            height={250}
            width={250}
            src="/icons/kioscoin-imagotipo.png"
            alt="Kioscoin"
          />
          {/* <div className="flex">
            <p className="text-5xl font-bold font-primary text-primary">
              Kioscoin
            </p>
          </div> */}
        </div>
        <div className="">
          <p className="text-center font-secondary sm:text-lg text-primary">
            <span
              className={cn(
                "inline-block transition-opacity duration-300 font-bold",
                isFading ? "opacity-0" : "opacity-100"
              )}
            >
              {currentVerb}
            </span>
            {t("slogan_suffix")}
          </p>
        </div>
        <div className="flex justify-center gap-3 font-primary w-full max-w-md mx-auto">
          <div className="border border-purple-200 bg-white/80 rounded-xl p-2 sm:p-3 text-center min-w-[110px] sm:min-w-[130px] shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-center mb-1">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <div className="font-secondary font-semibold text-primary text-xs">
              {t("p2p_market")}
            </div>
          </div>

          <div className="border border-purple-200 bg-white/80 rounded-xl p-2 sm:p-3 text-center min-w-[110px] sm:min-w-[130px] shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-center mb-1">
              <Shield className="h-6 w-6 text-secondary" />
            </div>
            {/* <div className="text-gray-500 text-sm sm:text-base font-bold leading-tight">
              $2M+
            </div> */}
            <div className="font-secondary font-semibold text-primary text-xs">
              {t("safe_operations")}
            </div>
          </div>

          <div className="border border-purple-200 bg-white/80 rounded-xl p-2 sm:p-3 text-center min-w-[110px] sm:min-w-[130px] shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-center mb-1">
              <CheckCircle2 className="h-6 w-6 text-secondary" />
            </div>
            {/* <div className="text-gray-500 text-sm sm:text-base font-bold leading-tight">
              99.9%
            </div> */}
            <div className="font-secondary font-semibold text-primary text-xs">
              {t("best_rate")}
            </div>
          </div>
        </div>
        {/* Auth Section - Compact size */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 font-secondary transform transition-transform duration-200 border border-secondary/10">
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
            <div>
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
    </div>
  );
}
