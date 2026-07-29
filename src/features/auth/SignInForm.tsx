"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-form-field"
        onSubmit={(e) => {
          e.preventDefault();
          const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
          const flow = submitter?.value === "signUp" ? "signUp" : "signIn";
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            let toastTitle = "";
            if (error.message.includes("Invalid password")) {
              toastTitle = "Invalid password. Please try again.";
            } else {
              toastTitle =
                flow === "signIn"
                  ? "Could not sign in. Check your email and password."
                  : "Could not create account. Try a different email or password.";
            }
            toast.error(toastTitle);
          });
        }}
      >
        <input
          className="auth-input-field"
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          required
        />
        <input
          className="auth-input-field"
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          required
        />
        <button className="auth-button" type="submit" value="signUp">
          Create new account
        </button>
        <button
          type="submit"
          value="signIn"
          className="w-full px-4 py-3 rounded border border-gray-200 bg-white text-gray-700 font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors shadow-sm hover:shadow"
        >
          Already have an account? Sign in
        </button>
        <p className="text-center text-xs text-gray-500">
          Email and password only. No verification codes or guest step.
        </p>
      </form>
      <p className="text-center text-sm text-secondary mt-4">
        Use the same email and password each time to return to your account.
      </p>
    </div>
  );
}
