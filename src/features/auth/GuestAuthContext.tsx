import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Authenticated } from "convex/react";

interface GuestUser {
  id: string;
  name: string;
  email: string;
}

interface GuestAuthContextType {
  isGuest: boolean;
  guestUser: GuestUser | null;
  loginAsGuest: () => void;
  logoutGuest: () => void;
}

const GuestAuthContext = createContext<GuestAuthContextType>({
  isGuest: false,
  guestUser: null,
  loginAsGuest: () => {},
  logoutGuest: () => {},
});

const GUEST_KEY = "spendsense_guest_mode";
const GUEST_USER: GuestUser = {
  id: "guest-user",
  name: "Guest",
  email: "guest@demo.com",
};

export function GuestAuthProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState(
    () => localStorage.getItem(GUEST_KEY) === "true"
  );

  const loginAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_KEY, "true");
    setIsGuest(true);
  }, []);

  const logoutGuest = useCallback(() => {
    localStorage.removeItem(GUEST_KEY);
    localStorage.removeItem("spendsense_guest_data");
    setIsGuest(false);
  }, []);

  return (
    <GuestAuthContext.Provider
      value={{
        isGuest,
        guestUser: isGuest ? GUEST_USER : null,
        loginAsGuest,
        logoutGuest,
      }}
    >
      {children}
    </GuestAuthContext.Provider>
  );
}

export function useGuestAuth() {
  return useContext(GuestAuthContext);
}

/** Renders children when user is either Convex-authenticated OR a guest */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isGuest } = useGuestAuth();
  if (isGuest) return <>{children}</>;
  return <Authenticated>{children}</Authenticated>;
}
