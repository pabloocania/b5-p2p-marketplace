import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { firebaseService, p2pMarketAPIClient } from "@/lib/APIClients";
import KioscoinBrand from "@/components/kioscoin/branding/KioscoinBrand";

type VerificationState = "idle" | "processing" | "success" | "error";

const EmailVerifiedPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [state, setState] = useState<VerificationState>("processing");
  const [messageKey, setMessageKey] = useState<string>(
    "email_verification.verifying"
  );

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { oobCode, loginId, continueUrl } = router.query;

    let resolvedLoginId: string | null = null;
    if (typeof loginId === "string") {
      resolvedLoginId = loginId.trim();
    }

    if (!resolvedLoginId && typeof continueUrl === "string") {
      try {
        const parsedContinue = new URL(continueUrl, window.location.origin);
        const params = parsedContinue.searchParams;
        const legacyLoginId = params.get("loginId")?.trim();
        resolvedLoginId = legacyLoginId || null;
      } catch (_error) {
        // ignore malformed continueUrl
      }
    }

    if (!resolvedLoginId) {
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
        await p2pMarketAPIClient.verifyUserEmail({ loginId: resolvedLoginId });
        setState("success");
        setMessageKey("email_verification.success");
      } catch (error) {
        console.error("Email verification failed:", error);
        setState("error");
        setMessageKey("email_verification.failure");
      }
    };

    verify();
  }, [router.isReady, router.asPath]);

  const showSuccessDetail = state === "success";

  return (
    <>
      <Head>
        <title>{t("email_verification.title")} | Kioscoin</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg space-y-10">
            <KioscoinBrand showSlogan className="justify-center" />

            <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-xl p-8 sm:p-10 space-y-6 text-center font-secondary">
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

              {state === "processing" && (
                <p className="text-xs uppercase tracking-wide text-primary/80">
                  {t("email_verification.verifying")}
                </p>
              )}

              {showSuccessDetail && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t("email_verification.success_detail")}
                  </p>
                </div>
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
