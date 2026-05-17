'use client';

import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="grid gap-6"><p className="text-center text-muted-foreground">Loading...</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

// Made with Bob
