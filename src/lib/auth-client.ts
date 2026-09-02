import { createAuthClient } from "better-auth/react";
import { getClientAuthBaseURL } from "@/lib/auth-config";

export const authClient = createAuthClient({
  baseURL: getClientAuthBaseURL(),
});

export const { signIn, signOut, useSession } = authClient;
