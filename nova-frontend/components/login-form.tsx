"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LocationSelector } from "@/components/location-selecter";
import Image from "next/image";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


// Define the API call function
const loginRequest = async (credentials: { 
  EmpNo: string; 
  password: string; 
  location?: string;
  coordinates?: string;
}) => {
  try {
    console.log("Sending credentials:", credentials); // Debug log
    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        EmpNo: credentials.EmpNo,
        password: credentials.password,
        ...(credentials.location && { location: credentials.location }),
        ...(credentials.coordinates && { coordinates: credentials.coordinates })
      }),
    });

    console.log("Response status:", response.status); // Debug log

    if (response.status === 401) {
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Login error:", errorData); // Debug log
      throw new Error(errorData?.message || "Login failed");
    }

    const data = await response.json();
    if (data.token) {
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("EmpNo", JSON.stringify(data.EmpNo));
      sessionStorage.setItem("location", JSON.stringify(data.location));
      sessionStorage.setItem("EmpName", JSON.stringify(data.empname));
      sessionStorage.setItem("EmpCompID", JSON.stringify(data.EmpCompID));
      sessionStorage.setItem("role", JSON.stringify(data.role));
      console.log("Login successful, token stored"); // Debug log
    } else {
      throw new Error("Token not found in response");
    }
    return data;
  } catch (error) {
    console.error("Login request error:", error); // Debug log
    throw error;
  }
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [EmpNo, setEmpNo] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  // UseEffect to redirect if already logged in
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      router.push("/protectedpages/asset-transfer");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!EmpNo || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const credentials: { 
        EmpNo: string; 
        password: string; 
        location?: string;
        coordinates?: string;
      } = {
        EmpNo,
        password
      };

      if (selectedLocation) {
        credentials.location = selectedLocation.address;
        credentials.coordinates = `${selectedLocation.latitude}.${selectedLocation.longitude}`;
        console.log("Submitting with location:", credentials.location); // Debug log
        console.log("Submitting with coordinates:", credentials.coordinates); // Debug log
      }
      
      const data = await loginRequest(credentials);
      await router.push("/protectedpages/asset-transfer");
    } catch (error: any) {
      console.error("Login error:", error); // Debug log
      if (error.message === "Unauthorized") {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.error(error.message || "Something went wrong. Try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 w-full bg-zinc-50">
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
              <div className="grid gap-3">
                <Label>Location (Optional)</Label>
                <LocationSelector 
                  onLocationSelect={(location) => setSelectedLocation(location)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <a href="/register" className="text-primary hover:underline">
                  Register here
                </a>
              </p>
            </div>
          </form>
         <div className="relative hidden md:block" >
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Image
                     src="/logo.png" // replace with your illustration path
                     alt="Registration Illustration"
                     width={400}
                     height={400}
                     className="object-contain"
                   />
                 </div>
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
