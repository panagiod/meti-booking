import { Suspense } from "react";
import { LoadingPage } from "@/components/ui/loading";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
