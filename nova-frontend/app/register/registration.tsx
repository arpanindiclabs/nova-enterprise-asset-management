"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import Link from "next/link"

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type Company = {
  CompCode: string
  CompName: string
}

export default function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])

  const [form, setForm] = useState({
    EmpNo: "",
    EmpName: "",
    EmpCompID: "",
    EmpDeptID: "",
    EmpContNo: "",
    Password: "",
    token: "",
    Location: "",
  })

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${apiUrl}/utils/get-companies`)
        const data = await res.json()
        setCompanies(data)
      } catch (err) {
        toast.error("Failed to load companies")
        console.error(err)
      }
    }
    fetchCompanies()
  }, [])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error("Registration failed")

      toast.success("Registration successful")
      router.push("/login")
    } catch (err) {
      toast.error("Something went wrong")
      console.error(err)
    }
  }

  return (
     (
   <div className={cn("flex flex-col gap-6 max-w-5xl mx-auto", className)} {...props}>
  <Card className="overflow-hidden p-0 w-full max-w-5xl mx-auto">
    <CardContent className="grid p-0 md:grid-cols-2">
      <form onSubmit={handleSubmit} className="p-8 md:p-12 w-full">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold">Register</h1> {/* Slightly bigger heading */}
            <p className="text-muted-foreground text-balance">
              Create a new employee account
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6"> {/* increased gap */}
            {/* All input groups remain the same, just increase gap here */}
            <div className="grid gap-3"> {/* increase gap here from 1 to 3 */}
              <Label htmlFor="EmpNo">Employee No</Label>
              <Input
                id="EmpNo"
                placeholder="Enter employee ID"
                value={form.EmpNo}
                onChange={(e) => handleChange("EmpNo", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="EmpName">Employee Name</Label>
              <Input
                id="EmpName"
                placeholder="Full name"
                value={form.EmpName}
                onChange={(e) => handleChange("EmpName", e.target.value)}
                required
              />
            </div>

            {/* Repeat gap-3 for all others */}
            <div className="grid gap-3">
              <Label htmlFor="EmpDeptID">Department ID</Label>
              <Input
                id="EmpDeptID"
                placeholder="Max 8 characters"
                maxLength={8}
                value={form.EmpDeptID}
                onChange={(e) => handleChange("EmpDeptID", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="EmpContNo">Contact No</Label>
              <Input
                id="EmpContNo"
                placeholder="Phone number"
                value={form.EmpContNo}
                onChange={(e) => handleChange("EmpContNo", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="Password">Password</Label>
              <Input
                id="Password"
                type="password"
                placeholder="Create a password"
                value={form.Password}
                onChange={(e) => handleChange("Password", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="token">Registration Token</Label>
              <Input
                id="token"
                placeholder="Enter token"
                value={form.token}
                onChange={(e) => handleChange("token", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="Location">Location (optional)</Label>
              <Input
                id="Location"
                placeholder="e.g. Bangalore Office"
                value={form.Location}
                onChange={(e) => handleChange("Location", e.target.value)}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="EmpCompID">Company</Label>
              <Select
                onValueChange={(value) => handleChange("EmpCompID", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem
                      key={company.CompCode.trim()}
                      value={company.CompCode.trim()}
                    >
                      {company.CompName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Register
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Login here
            </a>
          </p>
        </div>
      </form>

      <div className="bg-muted relative hidden md:block" />
    </CardContent>
  </Card>

  <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
    By registering, you agree to our <a href="#">Terms of Service</a> and{" "}
    <a href="#">Privacy Policy</a>.
  </div>
</div>


  )
  )
}
