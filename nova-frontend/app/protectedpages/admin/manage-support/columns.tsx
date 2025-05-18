import { useState } from "react"
import { ArrowUpDown, Filter, MoreHorizontal } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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
const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export type SupportCall = {
  RecID: number
  Call_Id: string | null
  AssetCode: string | null
  AssetType: string | null
  CallRegDate: string | null
  Empno: string | null
  UserName: string | null
  IssueType: string | null
  IssueDetails: string | null
  EnteredBy: string | null
  CallAssignTo: string | null
  ServiceCost: number | null
  CallStatus: string | null
  ClosedBy: string | null
  CloseDate: string | null
  CallRemarks: string | null
  UpdatedBy: string | null
  CallDetail_ID: number | null
  callAssignedDt: string | null
  CallAttainedBy: string | null
  ActionTaken: string | null
  ActionTakenDt: string | null
  CallEscalationNo: string | null
  EscalationTo: string | null
  EscalationDt: string | null
  CallDetailStatus: string | null
  CallDetailRemarks: string | null
  ResolveStatus: boolean | null
  EscalationStatus: boolean | null
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
        <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
      <FilterDropdown columnName={accessor} />
    </div>
  ),
  accessorKey: accessor,
})

const renderBooleanBadge = (value: boolean | null, trueLabel: string, falseLabel: string) => {
  if (value === null) return <Badge variant="secondary">N/A</Badge>
  return value ? (
    <Badge variant="default">{trueLabel}</Badge>
  ) : (
    <Badge variant="destructive">{falseLabel}</Badge>
  )
}

export const getColumns = (
  // onRowAction: (data: SupportCall) => void,
  // onResolve: (id: number) => void,
  // onEscalate: (id: number) => void
): ColumnDef<SupportCall>[] => [
  makeSortableHeader("Support Code", "Call_Id"),
  makeSortableHeader("Asset Code", "AssetCode"),
  makeSortableHeader("Asset Type", "AssetType"),
  makeSortableHeader("Call Reg Date", "CallRegDate"),
  makeSortableHeader("Employee No.", "Empno"),
  makeSortableHeader("User Name", "UserName"),
  makeSortableHeader("Issue Type", "IssueType"),
  makeSortableHeader("Issue Details", "IssueDetails"),
  makeSortableHeader("Entered By", "EnteredBy"),
  makeSortableHeader("Call Assign To", "CallAssignTo"),
  makeSortableHeader("Service Cost", "ServiceCost"),
  makeSortableHeader("Call Status", "CallStatus"),
  makeSortableHeader("Closed By", "ClosedBy"),
  makeSortableHeader("Close Date", "CloseDate"),
  makeSortableHeader("Call Remarks", "CallRemarks"),
  makeSortableHeader("Updated By", "UpdatedBy"),
  makeSortableHeader("Call Detail ID", "CallDetail_ID"),
  makeSortableHeader("Assigned Date", "callAssignedDt"),
  makeSortableHeader("Call Attained By", "CallAttainedBy"),
  makeSortableHeader("Action Taken", "ActionTaken"),
  makeSortableHeader("Action Taken Dt", "ActionTakenDt"),
  makeSortableHeader("Call Escalation No.", "CallEscalationNo"),
  makeSortableHeader("Escalation To", "EscalationTo"),
  makeSortableHeader("Escalation Dt", "EscalationDt"),
  makeSortableHeader("Call Detail Status", "CallDetailStatus"),
  makeSortableHeader("Call Detail Remarks", "CallDetailRemarks"),
  {
    ...makeSortableHeader("Resolved?", "ResolveStatus"),
    cell: ({ row }) => renderBooleanBadge(row.getValue("ResolveStatus"), "Resolved", "Pending"),
  },
  {
    ...makeSortableHeader("Escalated?", "EscalationStatus"),
    cell: ({ row }) => renderBooleanBadge(row.getValue("EscalationStatus"), "Yes", "No"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const call = row.original
      const id = call.CallDetail_ID

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
             <DropdownMenuItem onClick={() => console.log("Modify", call)}>Modify</DropdownMenuItem>
            <DropdownMenuItem
                  onClick={async () => {
  try {
    const empNo = (sessionStorage.getItem("EmpNo") || "")
      .replace(/^"|"$/g, "")
      .replace(/^./, c => c.toUpperCase())

    console.log("Marking as resolved", call.RecID, empNo)

    const res = await fetch(`${apiUrl}/manage-support/resolve/${call.RecID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ResolveStatus: 1,
        ClosedBy: empNo,
        UpdatedBy: empNo
      }),
    })

    if (!res.ok) {
      throw new Error("Failed to update support call.")
    }

    const updated = await res.json()
    console.log("Resolved call:", updated)
    toast.success("Support call marked as resolved")
  } catch (err) {
    console.error(err)
    toast.error("Failed to mark as resolved")
  }
}}
              >
                Mark as Resolved
              </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={async () => {
  try {
    const empNo = (sessionStorage.getItem("EmpNo") || "")
      .replace(/^"|"$/g, "")
      .replace(/^./, c => c.toUpperCase())

    console.log("Marking as resolved", call.RecID, empNo)

    const res = await fetch(`${apiUrl}/manage-support/escalate/${call.RecID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ResolveStatus: 1,
        escalatedby: empNo,
        // escalatedto: null
      }),
    })

    if (!res.ok) {
      throw new Error("Failed to update support call.")
    }

    const updated = await res.json()
    console.log("Resolved call:", updated)
    toast.success("Support call has been escalated")
  } catch (err) {
    console.error(err)
    toast.error("Failed to mark as resolved")
  }
}}
            >Escalate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
