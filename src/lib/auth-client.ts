import { createAuthClient } from "better-auth/react";

// En previews de Vercel la URL cambia por deployment: si no hay env configurada,
// se deriva del origin actual del browser (funciona en prod y staging).
const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:3000");

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signOut, useSession } = authClient;
