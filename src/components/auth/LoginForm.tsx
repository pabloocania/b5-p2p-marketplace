import { useState } from "react";
import { firebaseAuthService, AuthResult } from "../../lib/FirebaseAuthService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: (userData: AuthResult) => void;
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
  onEmailLinkClick: () => void;
}

export function LoginForm({
  onLoginSuccess,
  onRegisterClick,
  onForgotPasswordClick,
  onEmailLinkClick,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await firebaseAuthService.signInWithEmail(email, password);

      if (result.success && result.user) {
        onLoginSuccess(result);
      } else {
        setError(
          result.error || "Login failed. Please check your credentials."
        );
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to sign in to your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <span className="flex items-center gap-1">
                    <EyeOff className="h-3 w-3" /> Hide
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Show
                  </span>
                )}
              </Button>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="button"
            variant="link"
            className="px-0 font-normal text-xs"
            onClick={onForgotPasswordClick}
            disabled={isLoading}
          >
            Forgot your password?
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Button
              type="button"
              variant="link"
              className="px-0 font-normal"
              onClick={onRegisterClick}
              disabled={isLoading}
            >
              Create an account
            </Button>
          </div>

          <div className="flex justify-between w-full text-sm">
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={onEmailLinkClick}
            >
              Sign in with email link
            </Button>
          </div>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
