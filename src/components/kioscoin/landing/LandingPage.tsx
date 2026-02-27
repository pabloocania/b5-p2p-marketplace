"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useKioscoinUserContext } from "@/components/kioscoin/users/KioscoinUserContext";
import { Users, CheckCircle2, Shield } from "lucide-react";
import KioscoinBrand from "../branding/KioscoinBrand";
import KioscoinUserLoginFlow from "../users/KioscoinUserLoginFlow";

export function LandingPage() {
  const { t } = useTranslation();
  const { login } = useKioscoinUserContext();
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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col gap-5 text-center px-1">
        {/* <KioscoinBrand showSlogan className="justify-center" /> */}
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
        <KioscoinUserLoginFlow
          variant="inline"
          onLogin={login}
          showBrand={false}
        />
      </div>
    </div>
  );
}
