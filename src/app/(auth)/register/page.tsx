import { isGoogleOAuthConfigured } from "@/lib/google-oauth";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return <RegisterForm googleOAuthEnabled={isGoogleOAuthConfigured()} />;
}
