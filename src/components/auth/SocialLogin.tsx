import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { firebaseService } from "../../lib/APIClients";
import { Loader2 } from "lucide-react";

interface SocialLoginProps {
  onLoginSuccess: (user: any) => void;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await firebaseService.signInWithGoogle();
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || "Failed to sign in with Google");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await firebaseService.signInWithFacebook();
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || "Failed to sign in with Facebook");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwitterLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await firebaseService.signInWithTwitter();
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || "Failed to sign in with Twitter");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Separator className="my-4" />
      <div className="text-center text-sm text-gray-500">Or continue with</div>

      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <img src="/google-icon.svg" alt="Google" className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleFacebookLogin}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <img src="/facebook-icon.svg" alt="Facebook" className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleTwitterLogin}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <img src="/twitter-icon.svg" alt="Twitter" className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
