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

export type HardwareAction = {
  recID: number
  Title: string | null
  Action_Date: string | null
  Action_Type: string | null
  Action_Details: string | null
  In_Out: string | null
  Received_From: string | null
  Issue_To: string | null
  Entered_By: string | null
  Expenses: number | null
  Remarks: string | null
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

    console.log("Filter state updated in cookies:", currentFilters)
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
    <div className="flex items-center m-0 justify-between bg-muted/30 p-0 rounded-sm">
      <Button
        variant="ghost"
        className="px-0 mx-0 text-sm font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
      <FilterDropdown columnName={accessor} />
    </div>
  ),
  accessorKey: accessor,
})

export const getHardwareActionsColumns = (
  onRowAction: (data: HardwareAction) => void
): ColumnDef<HardwareAction>[] => [
  {
    accessorKey: "recID",
    header: () => null,
    cell: () => null,
  },
  makeSortableHeader("Title", "Title"),
  makeSortableHeader("Action Date", "Action_Date"),
  makeSortableHeader("Action Type", "Action_Type"),
  makeSortableHeader("Action Details", "Action_Details"),
  makeSortableHeader("In/Out", "In_Out"),
  makeSortableHeader("Received From", "Received_From"),
  makeSortableHeader("Issue To", "Issue_To"),
  makeSortableHeader("Entered By", "Entered_By"),
  makeSortableHeader("Expenses", "Expenses"),
  makeSortableHeader("Remarks", "Remarks"),
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const action = row.original
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
            <DropdownMenuItem onClick={() => onRowAction(action)}>
              Modify
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 
