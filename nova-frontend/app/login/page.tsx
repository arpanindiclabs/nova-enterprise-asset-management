"use client"
import { LoginForm } from "@/components/login-form"
import { logEvent } from "firebase/analytics";
import { analytics } from "@/lib/firebase";
import { useEffect } from "react";


export default function LoginPage() {
  useEffect(() => {
    if (analytics) {
      logEvent(analytics, "login_page_view");
    }
  }, []);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  )
}
