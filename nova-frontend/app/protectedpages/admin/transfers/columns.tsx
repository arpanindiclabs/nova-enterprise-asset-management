import { useState } from "react"
import { format } from "date-fns"
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
import { toast } from "sonner"
const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export type Transfer = {
  RecID: number
  TransferCode: string | null
  AssetCode: string | null
  AssetDesc: string | null
  TransferFrom: string | null
  TransferTo: string | null
  ReasonOfTransfer: string
  ApproveByTransTo: number | null
  ApproveByAdmin: number | null
  Remarks: string | null
  EnteredBy: string | null
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
    <div className="flex items-center justify-between bg-muted/30 rounded-sm px-2 py-1">
      <Button
        variant="ghost"
        className="p-0 text-sm font-medium"
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

export const getTransferColumns = (): ColumnDef<Transfer>[] => [
  makeSortableHeader("Transfer Code", "TransferCode"),
  makeSortableHeader("Asset Code", "AssetCode"),
  makeSortableHeader("Description", "AssetDesc"),
  makeSortableHeader("From", "TransferFrom"),
  makeSortableHeader("To", "TransferTo"),
  makeSortableHeader("Reason", "ReasonOfTransfer"),
  {
    ...makeSortableHeader("Admin Approval", "ApproveByAdmin"),
    cell: ({ row }) => {
      const status = row.getValue("ApproveByAdmin")
      return (
        <Badge variant={status === 1 ? "green" : status === 0 ? "destructive" : "secondary"}>
          {status === 1 ? "Approved" : status === 0 ? "Rejected" : "Pending"}
        </Badge>
      )
    },
  },
  {
    ...makeSortableHeader("To Approval", "ApproveByTransTo"),
    cell: ({ row }) => {
      const status = row.getValue("ApproveByTransTo")
      return (
        <Badge variant={status === 1 ? "green" : status === 0 ? "destructive" : "secondary"}>
          {status === 1 ? "Approved" : status === 0 ? "Rejected" : "Pending"}
        </Badge>
      )
    },
  },
  makeSortableHeader("Remarks", "Remarks"),
  makeSortableHeader("Entered By", "EnteredBy"),
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const transfer = row.original

      const handleApproval = async (status: number) => {

        console.log("Transfer Code:", transfer)
        try {
          console.log("Sending approval request...");
      
          const res = await fetch(
            `${apiUrl}/transfer-asset-function/approve-by-admin/${transfer.TransferCode?.trim() ?? ""}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ApproveByAdmin: status }),
            }
          );
      
          // Read and parse response JSON
          const data = await res.json();
          console.log("Response body:", data);
      
          if (res.ok) {
            toast.success(data.message || `Transfer ${status === 1 ? "approved" : "rejected"} successfully`);
            console.log("Approval successful. Reloading page...");
            // Optionally reload or refetch data here
          } else {
            toast.error(data.message || "Failed to update approval");
            console.error("Server responded with error:", res.status);
          }
        } catch (err) {
          console.error("Fetch error:", err);
          toast.error("Something went wrong");
        }
      };
      

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {transfer.ApproveByTransTo === 1 ? (
              <>
                <DropdownMenuItem onClick={() => handleApproval(1)}>
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleApproval(0)} className="text-red-500">
                  Reject
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem disabled>
                You need transferee&apos;s approval first
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
