import { useState } from "react";
import { firebaseService, AuthResult } from "../../lib/FirebaseUnifiedService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2 } from "lucide-react";

interface EmailLinkAuthFormProps {
  onLoginSuccess: (userData: AuthResult) => void;
  onBackToLogin: () => void;
}

export function EmailLinkAuthForm({
  onLoginSuccess,
  onBackToLogin,
}: EmailLinkAuthFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await firebaseService.sendSignInLinkToEmail(email);

      if (result) {
        setSuccess(true);
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign in with email link</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to sign in.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert>
              <AlertDescription>
                Check your email for a sign-in link. Click the link to complete
                the sign-in process.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || success}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : success ? (
              "Link sent!"
            ) : (
              "Send sign-in link"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onBackToLogin}
          >
            Back to login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
