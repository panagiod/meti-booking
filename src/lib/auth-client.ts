import { createAuthClient } from "better-auth/react";

// On Vercel previews the URL changes per deployment: if no env is configured,
// it is derived from the browser's current origin (works in prod and staging).
const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signOut, useSession } = authClient;
