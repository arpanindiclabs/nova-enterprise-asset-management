import { useState } from "react"
import { ArrowUpDown, Filter, MoreHorizontal } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import Cookies from "js-cookie"

export type EmpData = {
  EmpRecID: number
  EmpNo: string | null
  EmpName: string | null
  EmpCompID: string | null
  EmpDeptID: string | null
  EmpContNo: string | null
  IsActive: boolean | null
  Username: string | null
  Password: any
  LastLogin: string | null
  LastLocation: string | null
  IsAdmin: boolean | null
}

const companyCodeMap: Record<string, string> = {
  "C001": "Al-Naba Group LLC",
  "C002": "Al-Naba Services LLC",
  "C003": "Al-Naba Supplies - Catering LLC",
  "C004": "Al-Naba Infrastructure LLC",
  "C005": "Al-Ariq Equipment LLC",
}

const getCompanyName = (code: string | null) => {
  if (!code) return "N/A"
  const trimmed = code.trim()
  return companyCodeMap[trimmed] || trimmed
}

const filterOptions = [
  "Contains",
  "DoesNotContain",
  "StartsWith",
  "EndsWith",
  "EqualTo",
  "NotEqualTo",
  "GreaterThan",
  "LessThan",
  "GreaterThanOrEqualTo",
  "LessThanOrEqualTo",
]

function FilterDropdown({ columnName }: { columnName: string }) {
  const [input, setInput] = useState("")

  const handleSelect = (value: string) => {
    const cookieValue = Cookies.get("filterState")
    const currentFilters = cookieValue ? JSON.parse(cookieValue) : []

    const existing = currentFilters.find((f: any) => f.column === columnName)

    if (existing) {
      existing.criteria = value
      existing.filterwith = input
    } else {
      currentFilters.push({ column: columnName, criteria: value, filterwith: input })
    }

    Cookies.set("filterState", JSON.stringify(currentFilters), { expires: 1 })
    window.dispatchEvent(new Event("cookie-storage-change"))
    window.dispatchEvent(new Event("cookie-change"))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="m-0 p-0 h-7 w-7 text-muted-foreground">
          <Filter className="h-2 w-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 text-sm w-44">
        <Input
          placeholder="Enter value"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="mb-2 h-8 text-xs"
        />
        {filterOptions.map(opt => (
          <DropdownMenuItem key={opt} onClick={() => handleSelect(opt)}>
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const makeSortableHeader = (label: string, accessor: string) => ({
  header: ({ column }: any) => (
    <div className="flex items-center justify-between bg-muted/30 p-0 rounded-sm">
      <Button
        variant="ghost"
        className="px-0 mx-0 text-sm font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
      <FilterDropdown columnName={accessor} />
    </div>
  ),
  accessorKey: accessor,
})

const renderBooleanBadge = (value: boolean | null, trueLabel: string, falseLabel: string) => {
  if (value === null || value === undefined) return <Badge variant="secondary">N/A</Badge>
  return value ? <Badge variant="green">{trueLabel}</Badge> : <Badge variant="red">{falseLabel}</Badge>
}

export const getColumns = (onEdit: (emp: EmpData) => void): ColumnDef<EmpData>[] => [
  makeSortableHeader("Emp No", "EmpNo"),
  makeSortableHeader("Emp Name", "EmpName"),
  {
    ...makeSortableHeader("Company", "EmpCompID"),
    cell: ({ row }) => getCompanyName(row.getValue("EmpCompID")),
  },
  makeSortableHeader("Department ID", "EmpDeptID"),
  makeSortableHeader("Contact No", "EmpContNo"),
  {
    ...makeSortableHeader("Is Active", "IsActive"),
    cell: ({ row }) => renderBooleanBadge(row.getValue("IsActive"), "Active", "Inactive"),
  },
  makeSortableHeader("Username", "Username"),
  {
    ...makeSortableHeader("Last Login", "LastLogin"),
    cell: ({ row }) => {
      const val = row.getValue("LastLogin")
      return val ? new Date(val).toLocaleString() : "N/A"
    },
  },
  makeSortableHeader("Last Location", "LastLocation"),
  {
    ...makeSortableHeader("Is Admin", "IsAdmin"),
    cell: ({ row }) => renderBooleanBadge(row.getValue("IsAdmin"), "Admin", "User"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const employee = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(employee)}>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
