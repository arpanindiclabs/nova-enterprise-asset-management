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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"

type Employee = {
  EmpNo: string
  EmpName: string
}

type Asset = {
  AssetCode: string
  AssetDescription: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export default function TransferAssetForm() {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    deviceId: "",
    deviceType: "",
    transferType: "",
    remarks: "",
  })

  const [employees, setEmployees] = useState<Employee[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [open, setOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const EmpCode = sessionStorage.getItem("EmpNo")?.slice(1, -1)

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    if (!token || !EmpCode) {
      toast.error("Missing token or EmpNo")
      return
    }

    fetch(`${apiUrl}/utils/assets/${EmpCode}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAssets(data.assets || [])
      })
      .catch(() => {
        toast.error("Failed to fetch assets")
      })
  }, [EmpCode])

  useEffect(() => {
    fetch(`${apiUrl}/utils/get-employees`)
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch(() => toast.error("Failed to fetch employees"))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = sessionStorage.getItem("token")
    if (!token || !EmpCode) {
      toast.error("Authorization token or EmpCode not found.")
      return
    }

    const payload = {
      AssetCode: formData.deviceId,
      AssetDesc: formData.deviceType,
      TransferFrom: EmpCode,
      TransferTo: formData.to,
      ReasonOfTransfer: formData.remarks,
    }

    try {
      const res = await fetch(`${apiUrl}/transfer-asset-function/add-transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success("Asset transfer submitted successfully!")
        setFormData({
          from: "",
          to: "",
          deviceId: "",
          deviceType: "",
          transferType: "",
          remarks: "",
        })
        setSelectedEmployee(null)
      } else {
        const err = await res.json()
        toast.error(`Error: ${err.message || "Submission failed"}`)
      }
    } catch (err) {
      toast.error("Network error occurred")
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
              value={EmpCode}
              placeholder="Your Emp Code"
            />
            <p className="text-sm text-muted-foreground">Who is transferring the asset.</p>
          </div>

          <div className="space-y-2">
            <Label>Transfer To</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {selectedEmployee
                    ? `${selectedEmployee.EmpNo} - ${selectedEmployee.EmpName}`
                    : "Select employee..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search employee..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandEmpty>No employee found.</CommandEmpty>
                  <CommandGroup>
                    {employees
                      .filter((emp) =>
                        `${emp.EmpNo} ${emp.EmpName}`.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((emp) => (
                        <CommandItem
                          key={emp.EmpNo}
                          onSelect={() => {
                            setSelectedEmployee(emp)
                            setFormData({ ...formData, to: emp.EmpNo })
                            setOpen(false)
                          }}
                        >
                          {emp.EmpNo} - {emp.EmpName}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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
