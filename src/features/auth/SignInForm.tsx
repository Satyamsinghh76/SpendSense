"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";

const PRIVATE_EMAIL_DOMAIN = "spendsense.local";

function normalizeIdentity(rawValue: FormDataEntryValue | null) {
  const value = typeof rawValue === "string" ? rawValue.trim() : "";
  if (!value) return "";
  if (value.includes("@")) return value.toLowerCase();
  return `${value.toLowerCase()}@${PRIVATE_EMAIL_DOMAIN}`;
}

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
          const identity = normalizeIdentity(formData.get("identity"));
          if (!identity) {
            toast.error("Enter a username or email address.");
            return;
          }
          formData.set("email", identity);
          formData.delete("identity");
          formData.set("flow", flow);
          void signIn("password", formData)
            .then(() => {
              window.location.replace("/");
            })
            .catch((error) => {
              const message = error instanceof Error ? error.message : String(error);
              if (message.includes("Invalid password")) {
                toast.error("Password must be at least 8 characters and not empty.");
                return;
              }
              if (message.includes("already exists")) {
                toast.error("That account already exists. Use the existing account button instead.");
                return;
              }
              toast.error(
                flow === "signIn"
                  ? `Could not sign in: ${message}`
                  : `Could not create account: ${message}`,
              );
            });
        }}
      >
        <input
          className="auth-input-field"
          type="text"
          name="identity"
          placeholder="Username or email"
          autoComplete="username"
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
          Use a username or email with your password. No verification codes or guest step.
        </p>
      </form>
      <p className="text-center text-sm text-secondary mt-4">
        Use the same username or email and password each time to return to your account.
      </p>
    </div>
  );
}
