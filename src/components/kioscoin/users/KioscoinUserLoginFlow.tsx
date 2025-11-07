"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EmailLoginForm } from "./login/EmailLoginForm";
import { RegisterForm } from "./login/RegisterForm";
import { useTranslation } from "react-i18next";
import KioscoinBrand from "../branding/KioscoinBrand";
import { KioscoinUser, UserData } from "b5-api-client";

type Mode = "login" | "register";

interface KioscoinUserLoginFlowProps {
  variant?: "sheet" | "inline";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLogin: (user: KioscoinUser, userData: UserData) => void;
  showBrand?: boolean;
}

export default function KioscoinUserLoginFlow({
  variant = "inline",
  open,
  onOpenChange,
  onLogin,
  showBrand = true,
}: KioscoinUserLoginFlowProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("login");

  const AuthBlock = (
    <div className=" border border-secondary/10 rounded-lg shadow-lg bg-white w-full max-w-md mx-auto p-4 font-secondary transform transition-transform duration-200 border border-secondary/10">
      {showBrand && (
        <div className="flex flex-col items-center mb-4">
          <KioscoinBrand size="sm" showSlogan={false} />
        </div>
      )}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-3">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
            mode === "login"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {t("login")}
        </button>
        <button
          onClick={() => setMode("register")}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
            mode === "register"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {t("register")}
        </button>
      </div>
      <div className="min-h-[220px]">
        {mode === "login" ? (
          <EmailLoginForm
            onLogin={onLogin}
            onSwitchToRegister={() => setMode("register")}
          />
        ) : (
          <RegisterForm
            onLogin={onLogin}
            onSwitchToEmailLogin={() => setMode("login")}
          />
        )}
      </div>
    </div>
  );

  if (variant === "sheet") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <div />
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="h-[75vh] font-secondary bg-white p-0"
          closeText={t("close")}
          closeButtonPosition="right-5 top-1 font-bold"
        >
          <div className="w-full h-full overflow-y-auto pt-8 bg-secondary/10">
            {AuthBlock}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return AuthBlock;
}
