"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export default function AddAssetForm({ onRefresh }: { onRefresh?: () => void }) {
  const [showForm, setShowForm] = useState(false)

  const [companies, setCompanies] = useState<{ CompCode: string; CompName: string }[]>([])
  const [employees, setEmployees] = useState<{ EmpNo: string; EmpName: string }[]>([])

  const [openCompany, setOpenCompany] = useState(false)
  const [openEmployee, setOpenEmployee] = useState(false)
  const [openCurrentEmp, setOpenCurrentEmp] = useState(false)

  const [formData, setFormData] = useState({
    AssetCode: "",
    AssetERP_Code: "",
    AssetType: "",
    AssetDescription: "",
    PurchaseDate: "",
    OwnerCompany: "",
    PurchaseEmployeeName: "",
    currentEmpNo: "",
    PoNo: "",
    PoDate: "",
    PurchasedPrice: 0,
    VendorName: "",
    WarrantyDate: "",
    IsIssued: 0,
    UserContNo: "",
    UserCompany: "",
    IssuedDate: "",
    IssuedSite: "",
    IsActive: 1,
    IsScrraped: false,
    ScrapedDate: "",
    Remarks1: "",
    Remarks2: "",
    Remarks3: "",
    AssetBrand: "",
    AssetModel: "",
    AssetSlno: "",
    Location: "",
  })

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await fetch(`${apiUrl}/utils/get-companies`)
      const data = await res.json()
      setCompanies(data)
    }

    const fetchEmployees = async () => {
      const res = await fetch(`${apiUrl}/utils/get-employees`)
      const data = await res.json()
      setEmployees(data)
    }

    fetchCompanies()
    fetchEmployees()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target
    const parsedValue =
      type === "number" ? Number(value) : type === "checkbox" ? checked : value
    setFormData({ ...formData, [name]: parsedValue })
  }

  const handleDateChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(`${apiUrl}/manage-asset/add-asset`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      console.log(sessionStorage.getItem("token"))
      if (!res.ok) throw new Error("Failed to add asset")

      toast.success("Asset added successfully")
      onRefresh?.()
    } catch (error) {
      toast.error("Failed to add asset", {
        description: (error as Error).message,
      })
    }
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Add New Asset</h3>
          <p className="text-sm text-muted-foreground">
            Enter details of the asset to add it to the system.
          </p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Hide Form" : "Add Asset"}
          </Button>
          <Button onClick={onRefresh} variant="outline">
            Refresh Assets
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="p-6 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          >
            {Object.entries(formData).map(([key, value]) => {
              const isTextarea =
                key.toLowerCase().includes("remarks") ||
                key.toLowerCase().includes("description")
              const isCheckbox = typeof value === "boolean"
              const isNumber = typeof value === "number" && !isCheckbox
              const isDate = key.toLowerCase().includes("date")

              if (key === "UserCompany" || key === "OwnerCompany") {
                return (
                  <div key={key} className="space-y-2 col-span-1">
                    <Label htmlFor={key}>{key}</Label>
                    <select
                      name={key}
                      id={key}
                      value={value}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company.CompCode.trim()} value={company.CompCode.trim()}>
                          {company.CompName}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              }

              if (key === "PurchaseEmployeeName" || key === "currentEmpNo") {
                return (
                  <div key={key} className="space-y-2 col-span-1">
                    <Label htmlFor={key}>{key}</Label>
                    <select
                      name={key}
                      id={key}
                      value={value}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp.EmpNo} value={emp.EmpNo}>
                          {emp.EmpName} ({emp.EmpNo})
                        </option>
                      ))}
                    </select>
                  </div>
                )
              }

              return (
                <div key={key} className="space-y-2 col-span-1">
                  <Label htmlFor={key}>{key}</Label>
                  {isTextarea ? (
                    <Textarea
                      id={key}
                      name={key}
                      value={value}
                      placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").trim()}`}
                      onChange={handleChange}
                    />
                  ) : isCheckbox ? (
                    <input
                      type="checkbox"
                      id={key}
                      name={key}
                      checked={value as boolean}
                      onChange={handleChange}
                    />
                  ) : isDate ? (
                    <Input
                      type="date"
                      id={key}
                      name={key}
                      value={value}
                      onChange={(e) => handleDateChange(key, e.target.value)}
                    />
                  ) : (
                    <Input
                      type={isNumber ? "number" : "text"}
                      id={key}
                      name={key}
                      value={value}
                      placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").trim()}`}
                      onChange={handleChange}
                    />
                  )}
                </div>
              )
            })}

            <div className="col-span-full">
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-neutral-900"
              >
                Add Asset
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
