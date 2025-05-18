"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


// Define the API call function
const loginRequest = async (credentials: { EmpNo: string; password: string; location: string }) => {
  const response = await fetch(`${apiUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials), // Now dynamic
  });

  console.log("Response: ", response);

  if (response.status === 401) {
    throw new Error("Unauthorized");
    localStorage.removeItem("token");
  }

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const data = await response.json();
  // Assuming the token is under data.token
  if (data.token) {
    sessionStorage.setItem("token", data.token); // ✅ Save encrypted JWT
    sessionStorage.setItem("EmpNo", JSON.stringify(data.EmpNo)); // Save user data
    sessionStorage.setItem("location", JSON.stringify(data.location)); // Save user data
    sessionStorage.setItem("EmpName", JSON.stringify(data.empname)); // Save user data
    sessionStorage.setItem("EmpCompID", JSON.stringify(data.EmpCompID)); // Save user data
    sessionStorage.setItem("role", JSON.stringify(data.role));
    console.log("local storage ", sessionStorage.getItem("token"));
  } else {
    throw new Error("Token not found in response");
  }
  return data;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [EmpNo, setEmpNo] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // UseEffect to redirect if already logged in
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      router.push("/protectedpages/asset-transfer");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload

    const location = "Bangalore"; // This could be dynamic if needed

    setIsLoading(true); // Set loading state

    try {
      const data = await loginRequest({ EmpNo, password, location });
      // Redirect after successful login
      await router.push("/protectedpages/asset-transfer");
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.error("Something went wrong. Try again later.");
      }
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your account
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="EmpNo">Employee Number</Label>
                <Input
                  id="EmpNo"
                  type="text"
                  placeholder="AH0000"
                  onChange={(e) => setEmpNo(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            {/* <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            /> */}
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
