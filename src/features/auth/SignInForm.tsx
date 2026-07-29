"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useGuestAuth } from "@/features/auth/GuestAuthContext";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const { loginAsGuest } = useGuestAuth();

  return (
    <div className="w-full">
      <div className="flex flex-col gap-form-field">
        <button
          type="button"
          className="auth-button flex items-center justify-center gap-2"
          onClick={() => {
            void signIn("google", { redirectTo: "/dashboard" }).catch((error) => {
              const message = error instanceof Error ? error.message : String(error);
              toast.error(`Could not sign in with Google: ${message}`);
            });
          }}
        >
          <span className="text-lg">G</span>
          Continue with Google
        </button>
        <button
          type="button"
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
