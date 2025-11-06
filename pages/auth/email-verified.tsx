import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { firebaseService } from "@/lib/FirebaseUnifiedService";
import { p2pMarketAPIClient } from "@/lib/APIClients";
import KioscoinBrand from "@/components/kioscoin/branding/KioscoinBrand";

type VerificationState = "idle" | "processing" | "success" | "error";

const safeRedirect = (target?: string | string[] | null): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const value = Array.isArray(target) ? target[0] : target;

  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.origin === window.location.origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch (_error) {
    // Ignore invalid URLs and fall through to returning null.
  }

  return null;
};

const EmailVerifiedPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [state, setState] = useState<VerificationState>("processing");
  const [messageKey, setMessageKey] = useState<string>(
    "email_verification.verifying"
  );

  const continuePath = useMemo(
    () => safeRedirect(router.query.continueUrl ?? null),
    [router.query.continueUrl]
  );

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { oobCode, loginId } = router.query;

    if (typeof loginId !== "string") {
      setState("error");
      setMessageKey("email_verification.invalid_link");
      return;
    }

    const trimmedLoginId = loginId.trim();
    if (!trimmedLoginId) {
      setState("error");
      setMessageKey("email_verification.invalid_link");
      return;
    }

    const verify = async () => {
      try {
        setState("processing");
        const hasOobCode = typeof oobCode === "string" && oobCode.length > 0;

        if (hasOobCode) {
          setMessageKey("email_verification.applying_code");
          await firebaseService.applyEmailVerificationCode(oobCode);

          const currentUser = firebaseService.getCurrentUser();
          if (currentUser) {
            await currentUser.reload().catch(() => undefined);
            await currentUser.getIdToken(true).catch(() => undefined);
          }
        }

        setMessageKey("email_verification.syncing");
        await p2pMarketAPIClient.verifyUserEmail({ loginId: trimmedLoginId });
        setState("success");
        setMessageKey("email_verification.success");

        if (continuePath) {
          // Allow a brief moment for the success message before redirecting.
          setTimeout(() => {
            router.replace(continuePath);
          }, 1200);
        }
      } catch (error) {
        console.error("Email verification failed:", error);
        setState("error");
        setMessageKey("email_verification.failure");
      }
    };

    verify();
  }, [router, continuePath]);

  const showRedirectNotice = state === "success" && Boolean(continuePath);
  const showSuccessDetail = state === "success" && !showRedirectNotice;

  return (
    <>
      <Head>
        <title>{t("email_verification.title")} | Kioscoin</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg space-y-10">
            <KioscoinBrand showSlogan className="justify-center" />

            <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-xl p-8 sm:p-10 space-y-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${
                    state === "success"
                      ? "border-green-100 bg-green-50 text-green-600"
                      : state === "error"
                      ? "border-destructive/20 bg-destructive/10 text-destructive"
                      : "border-primary/20 bg-primary/10 text-primary"
                  }`}
                >
                  {state === "success" ? (
                    <CheckCircle2 className="h-8 w-8" />
                  ) : state === "error" ? (
                    <AlertTriangle className="h-8 w-8" />
                  ) : (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  )}
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-foreground">
                    {t("email_verification.title")}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {t(messageKey)}
                  </p>
                </div>
              </div>

              {state === "processing" && !showRedirectNotice && (
                <p className="text-xs uppercase tracking-wide text-primary/80">
                  {t("email_verification.verifying")}
                </p>
              )}

              {showSuccessDetail && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t("email_verification.success_detail")}
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  >
                    {t("email_verification.go_dashboard")}
                  </Link>
                </div>
              )}

              {showRedirectNotice && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("email_verification.redirecting")}
                </p>
              )}

              {state === "error" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t("email_verification.request_new")}
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full border border-input px-5 py-2 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
                  >
                    {t("email_verification.back_home")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default EmailVerifiedPage;
