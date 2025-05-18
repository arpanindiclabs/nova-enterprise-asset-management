// components/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    // If no token, redirect to login
    if (!token) {
      router.push("/login");
    } else {
      setLoading(false); // Once the check is done, set loading to false
    }
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Or you can show a spinner here
  }

  return <>{children}</>; // Only show children if token exists
}
