import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { firebaseService } from "../../../../lib/FirebaseUnifiedService";
import { FormInput } from "./FormInput";
import { LoadingButton } from "./LoadingButton";
import { ErrorAlert } from "./ErrorAlert";

export const EmailLinkLoginForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailLinkSent, setEmailLinkSent] = useState(false);

  const handleEmailLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await firebaseService.sendSignInLinkToEmail(email);

      if (result) {
        setEmailLinkSent(true);
      } else {
        setError("Failed to send sign-in link. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleEmailLinkLogin} className="space-y-4">
      <ErrorAlert error={error} />

      {emailLinkSent ? (
        <Alert>
          <AlertDescription>
            Check your email for a sign-in link. Click the link to complete the
            sign-in process.
          </AlertDescription>
        </Alert>
      ) : (
        <FormInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={setEmail}
          required
          disabled={isLoading}
        />
      )}

      <LoadingButton
        isLoading={isLoading}
        loadingText="Sending link..."
        buttonText={emailLinkSent ? "Link sent!" : "Send sign-in link"}
        onClick={() => {}}
        disabled={emailLinkSent}
      />
    </form>
  );
};
