"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

export default function SupportCallForm() {
  const [formData, setFormData] = useState({
    AssetCode: "",
    AssetType: "",
    // CallRegDate: new Date().toISOString(), // ✅ Full ISO string
    Empno: "",
    IssueType: "",
    IssueDetails: "",
    EnteredBy: "",
  })

  const EmpCode = sessionStorage.getItem("EmpNo")?.slice(1, -1) || ""

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      Empno: EmpCode,
      EnteredBy: EmpCode,
    }))
  }, [EmpCode])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Support Call Payload:", formData)

    const token = sessionStorage.getItem("token")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manage-support/new-support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.error || "Failed to create support call")
      }

      const result = await response.json()
      toast.success("Support call submitted successfully!")
      console.log("Server Response:", result)
    } catch (err: any) {
      console.error("Error submitting support call:", err)
      toast.error(`Error: ${err.message || "Something went wrong"}`)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <h3 className="text-lg font-medium">Report a Support Call</h3>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to report an issue with your assigned asset.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="Empno">Employee No</Label>
            <Input id="Empno" name="Empno" value={formData.Empno} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="AssetCode">Asset Code</Label>
            <Input
              id="AssetCode"
              name="AssetCode"
              placeholder="e.g. LAP1234"
              value={formData.AssetCode}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="AssetType">Asset Type</Label>
            <Input
              id="AssetType"
              name="AssetType"
              placeholder="e.g. Laptop, Printer"
              value={formData.AssetType}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="IssueType">Issue Type</Label>
            <Input
              id="IssueType"
              name="IssueType"
              placeholder="e.g. Hardware, Software"
              value={formData.IssueType}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="IssueDetails">Issue Details</Label>
            <Textarea
              id="IssueDetails"
              name="IssueDetails"
              placeholder="Describe the issue you are facing..."
              value={formData.IssueDetails}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="bg-black text-white hover:bg-neutral-900">
            Submit Support Call
          </Button>
        </form>
      </Card>
    </div>
  )
}
