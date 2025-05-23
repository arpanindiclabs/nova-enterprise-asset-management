import RegisterForm from "./registration"
import { app, analytics } from "@/lib/firebase";


export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[oklch(0.97_0.001_106.424)]
 p-4">
      <RegisterForm />
    </main>
  )
}
