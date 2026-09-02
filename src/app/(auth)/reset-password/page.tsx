import { Suspense } from "react";
import { LoadingPage } from "@/components/ui/loading";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
