import { Suspense } from "react";
import { LoadingPage } from "@/components/ui/loading";
import { isGoogleOAuthConfigured } from "@/lib/google-oauth";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <LoginForm googleOAuthEnabled={isGoogleOAuthConfigured()} />
    </Suspense>
  );
}
