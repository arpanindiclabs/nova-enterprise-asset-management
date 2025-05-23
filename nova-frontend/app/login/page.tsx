"use client"; // if this is a client component

import { logEvent } from "firebase/analytics";
import { analytics } from "@/lib/firebase";
import LoginForm from "./login-form";

export default function LoginPage() {
  React.useEffect(() => {
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
  );
}
