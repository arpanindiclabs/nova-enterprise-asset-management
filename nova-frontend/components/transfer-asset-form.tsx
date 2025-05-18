"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export default function TransferAssetForm() {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    deviceId: "",
    deviceType: "",
    transferType: "",
    remarks: "",
  })

  const [assets, setAssets] = useState<{ AssetCode: string; AssetDescription: string }[]>([])
  const [employees, setEmployees] = useState<{ EmpNo: string; EmpName: string }[]>([])
  const EmpCode = sessionStorage.getItem("EmpNo")?.slice(1, -1);

  useEffect(() => {
    const token = sessionStorage.getItem("token")


    if (!token || !EmpCode) {
      toast.error("Missing token or EmpNo")
      return
    }

    const fetchAssets = async () => {
      try {
        const res = await fetch(`${apiUrl}/utils/assets/${EmpCode}`, {
          // method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        const data = await res.json()
        console.log("Assets:", data)
        setAssets(data.assets || [])
      } catch (err) {
        console.error(err)
        toast.error("Failed to load assets")
      }
    }

    const fetchEmployees = async () => {
      try {
        const res = await fetch(`${apiUrl}/utils/get-employees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        setEmployees(data || [])
      } catch (err) {
        console.error(err)
        toast.error("Failed to load employees")
      }
    }

    fetchAssets()
    fetchEmployees()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = sessionStorage.getItem("token")
    if (!token) {
      toast.error("Authorization token not found.")
      return
    }

    

    const payload = {
      AssetCode: formData.deviceId,
      AssetDesc: formData.deviceType,
      TransferFrom: EmpCode,
      TransferTo: formData.to,
      ReasonOfTransfer: formData.remarks,
    }
    console.log("Payload:", payload)
    try {
      const response = await fetch(`${apiUrl}/transfer-asset-function/add-transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Success:", data)
        toast.success("Asset transfer submitted successfully!")
        setFormData({
          from: "",
          to: "",
          deviceId: "",
          deviceType: "",
          transferType: "",
          remarks: "",
        })
      } else {
        const errorData = await response.json()
        console.error("Error:", errorData)
        toast.error(`Error: ${errorData.message || "Submission failed."}`)
      }
    } catch (error) {
      console.error("Network error:", error)
      toast.error("Network error occurred. Please try again.")
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <h3 className="text-lg font-medium">Asset Transfer</h3>
        <p className="text-sm text-muted-foreground">Fill out the following to request a device transfer.</p>
      </div>

      <Card className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              name="from"
              disabled
              placeholder={EmpCode}
              value={EmpCode}
              onChange={handleChange}
            />
            <p className="text-sm text-muted-foreground">Who is transferring the asset.</p>
          </div>

          <div className="space-y-2">
            <Label>Transfer To</Label>
            <Select
              onValueChange={(value) => setFormData({ ...formData, to: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select recipient employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.EmpNo} value={emp.EmpNo}>
                    {emp.EmpNo} - {emp.EmpName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Device</Label>
            <Select
              onValueChange={(value) => {
                const selected = assets.find((a) => a.AssetCode === value)
                setFormData({
                  ...formData,
                  deviceId: value,
                  deviceType: selected?.AssetDescription ?? "",
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a device" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.AssetCode} value={asset.AssetCode}>
                    {asset.AssetCode} - {asset.AssetDescription}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transferType">Transfer Type</Label>
            <Input
              id="transferType"
              name="transferType"
              placeholder="e.g. Internal / External"
              value={formData.transferType}
              onChange={handleChange}
            />
            <p className="text-sm text-muted-foreground">Not sent to backend. Optional.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              name="remarks"
              placeholder="Add any additional info or notes..."
              value={formData.remarks}
              onChange={handleChange}
            />
            <p className="text-sm text-muted-foreground">Optional: Any special instructions.</p>
          </div>

          <Button type="submit" className="bg-black text-white hover:bg-neutral-900">
            Submit Request
          </Button>
        </form>
      </Card>
    </div>
  )
}
