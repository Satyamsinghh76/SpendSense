import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { GuestAuthProvider } from "@/features/auth/GuestAuthContext";
import "./index.css";
import App from "./App";
import { getConvexUrl } from "@/lib/convex-url";

const convex = new ConvexReactClient(getConvexUrl());

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <GuestAuthProvider>
      <App />
    </GuestAuthProvider>
  </ConvexAuthProvider>,
);
