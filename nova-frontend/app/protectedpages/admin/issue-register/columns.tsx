import { useState } from "react"
import { format } from "date-fns"
import { MoreHorizontal, ArrowUpDown, Filter } from "lucide-react"
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
import { toast } from "sonner"
const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export type Issue = {
  IssueRecID: number | null
  IssuedID: number | null
  AssetCode: string | null
  IssueDate: string | null
  IssueType: string | null
  IssueEmpno: string | null
  IssueEmpName: string | null
  IssueLocation: string | null
  IssueStatus: number | null
  ReturenStatus: number | null
  ReturnDate: string | null
  IssuedBy: string | null
  Remarks1: string | null
  Remarks2: string | null
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

    // ✅ Set cookie with 1-day expiry
    Cookies.set("filterState", JSON.stringify(currentFilters), { expires: 1 })

    // ✅ Trigger custom event to notify same-tab listeners
    window.dispatchEvent(new Event("cookie-storage-change"))
    window.dispatchEvent(new Event("cookie-change"));

    console.log("Filter state updated in cookies:", currentFilters)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="m-0 p-0 h-7 w-7 text-muted-foreground">
          <Filter className="h-2 w-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 text-sm w-44"> {/* Reduced width here */}
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
    <div className="flex items-center m-0 justify-between bg-muted/30 p-0 rounded-sm"> {/* Reduced padding */}
      <Button
        variant="ghost"
        className="px-0 mx-0 text-sm font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        <ArrowUpDown />
      </Button>
      <FilterDropdown columnName={accessor} />
    </div>
  ),
  accessorKey: accessor,
})

export const getColumns = (
  onRowAction: (data: Issue) => void
): ColumnDef<Issue>[] => [
  makeSortableHeader("Issue ID", "IssuedID"),
  makeSortableHeader("Asset Code", "AssetCode"),
  makeSortableHeader("Issue Type", "IssueType"),
  makeSortableHeader("Employee No.", "IssueEmpno"),
  makeSortableHeader("Employee Name", "IssueEmpName"),
  makeSortableHeader("Location", "IssueLocation"),
  {
    ...makeSortableHeader("Issue Status", "IssueStatus"),
    cell: ({ row }) => {
      const status = row.getValue("IssueStatus") as number | null
  
      let label = "Unknown"
      let variant: "default" | "green" | "red" = "default"
  
      if (status === 1) {
        label = "Issued"
        variant = "green"
      } else if (status === 0) {
        label = "Not Issued"
        variant = "red"
      }
  
      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    ...makeSortableHeader("Return Status", "ReturenStatus"),
    cell: ({ row }) => {
      const status = row.getValue("ReturenStatus") as number | null
  
      let label = "Unknown"
      let variant: "default" | "green" | "yellow" = "default"
  
      if (status === 1) {
        label = "Returned"
        variant = "green"
      } else if (status === 0) {
        label = "Not Returned"
        variant = "yellow"
      }
  
      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    ...makeSortableHeader("Return Date", "ReturnDate"),
    cell: ({ row }) => {
      const date = row.getValue("ReturnDate")
      return date ? format(new Date(date), "dd/MM/yyyy") : "N/A"
    },
  },
  {
    ...makeSortableHeader("Issue Date", "IssueDate"),
    cell: ({ row }) => {
      const date = row.getValue("IssueDate")
      return date ? format(new Date(date), "dd/MM/yyyy") : "N/A"
    },
  },
  makeSortableHeader("Issued By", "IssuedBy"),
  makeSortableHeader("Remarks 1", "Remarks1"),
  makeSortableHeader("Remarks 2", "Remarks2"),
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const issue = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 ">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-grey" onClick={() => onRowAction(issue)}>
              Modify
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
  className="text-red-500"
  onClick={async () => {
    try {
      const response = await fetch(`${apiUrl}/manage-issue-register/return/${issue.AssetCode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}) // optionally pass returnDate here
      });

      const data = await response.json();

      if (response.ok) {
        toast("Return processed successfully." , data);
      } else {
        toast( "Something went wrong during return." , data);
      }
    } catch (err) {
      toast( "Unexpected error during return." );
    }
  }}
>
  Return Asset
</DropdownMenuItem>          
</DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
