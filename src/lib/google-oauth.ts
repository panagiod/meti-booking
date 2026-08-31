const DEMO_CLIENT_ID = "demo-google-client-id";
const DEMO_CLIENT_SECRET = "demo-google-client-secret";

/** True when real Google Cloud OAuth credentials are configured (not demo placeholders). */
export function isGoogleOAuthConfigured(): boolean {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return false;
  if (clientId === DEMO_CLIENT_ID || clientSecret === DEMO_CLIENT_SECRET) return false;
  return true;
}
