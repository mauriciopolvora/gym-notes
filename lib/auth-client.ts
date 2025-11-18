import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

export const authClient = createAuthClient({
  baseURL, // Critical for Safari to construct redirect URLs correctly
  plugins: [convexClient()],
});
