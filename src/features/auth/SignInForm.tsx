"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useGuestAuth } from "@/features/auth/GuestAuthContext";
import { toast } from "sonner";
import { useState } from "react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const { loginAsGuest } = useGuestAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { redirectTo: "/" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Google sign-in error:", error);
      toast.error(`Google sign-in failed: ${message}`, {
        description: "Please check your connection and try again.",
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-form-field">
        <button
          type="button"
          id="google-signin-btn"
          disabled={isLoading}
          className="auth-button flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => void handleGoogleSignIn()}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Signing in…
            </>
          ) : (
            <>
              {/* Google "G" logo SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="h-5 w-5"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <button
          type="button"
          id="guest-signin-btn"
          className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
          onClick={() => {
            loginAsGuest();
            window.location.replace("/");
          }}
        >
          Continue as Guest
        </button>

        <p className="text-center text-xs text-gray-500">
          Use Google to sign in. Guest mode stays local in your browser.
        </p>
      </div>
      <p className="text-center text-sm text-secondary mt-4">
        Google creates or opens your account automatically.
      </p>
    </div>
  );
}
