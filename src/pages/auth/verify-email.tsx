import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { firebaseAuthService } from "../../lib/FirebaseAuthService";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmailLink = async () => {
      try {
        // Check if the current URL is a sign-in link
        if (!firebaseAuthService.isSignInWithEmailLink()) {
          setError("Invalid sign-in link. Please try again.");
          setIsLoading(false);
          return;
        }

        // Get the email from localStorage
        const savedEmail = firebaseAuthService.getEmailForSignIn();

        if (savedEmail) {
          setEmail(savedEmail);

          // Sign in with the email link
          const result = await firebaseAuthService.signInWithEmailLink(
            savedEmail
          );

          if (result.success) {
            // Redirect to dashboard on success
            router.push("/dashboard");
          } else {
            setError(result.error || "Failed to sign in with email link");
          }
        } else {
          // If email is not in localStorage, ask the user to enter it
          setEmail(null);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmailLink();
  }, [router]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailInput = formData.get("email") as string;

    try {
      // Sign in with the email link
      const result = await firebaseAuthService.signInWithEmailLink(emailInput);

      if (result.success) {
        // Redirect to dashboard on success
        router.push("/dashboard");
      } else {
        setError(result.error || "Failed to sign in with email link");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Complete the sign-in process by verifying your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : email ? (
            <Alert>
              <AlertDescription>
                Completing sign-in process for {email}...
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Enter the email you used to request the sign-in link"
                />
              </div>
              <Button type="submit" className="w-full">
                Complete sign-in
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/auth")}
          >
            Back to login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
