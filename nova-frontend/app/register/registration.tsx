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
        console.log(form)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
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
    <div className={cn("flex flex-col lg:w-[50vw] max-w-none ", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Register</h1>
                <p className="text-muted-foreground text-balance">
                  Create a new employee account
                </p>
              </div>

              {[
                { label: "Employee No", key: "EmpNo" },
                { label: "Employee Name", key: "EmpName" },
                { label: "Department ID", key: "EmpDeptID" },
                { label: "Contact No", key: "EmpContNo" },
                { label: "Password", key: "Password", type: "password" },
                { label: "Registration Token", key: "token" },
              ].map(({ label, key, type }) => (
                <div className="grid gap-1" key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type={type || "text"}
                    value={(form as any)[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    required
                  />
                </div>
              ))}

              <div className="grid gap-1 w-full">
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

              <Button type="submit" className="w-full">
                Register
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
        By registering, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
