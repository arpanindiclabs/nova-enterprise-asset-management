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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export type AssetReturns = {
  recid: number
  from_empcode: string | null
  assetcode: string | null
  approve_status: boolean | null
  remarks: string | null
  approved_by: string | null
  approved_at: Date | null
  remarks_from: string | null
  request_time: Date | null
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
import { toast } from "sonner"

const apiURl = process.env.NEXT_PUBLIC_API_URL

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

const renderBooleanBadge = (value: boolean | null, trueLabel: string, falseLabel: string) => {
  if (value === null || value === undefined) return <Badge variant="secondary">Pending</Badge>
  return value ? <Badge variant="green">{trueLabel}</Badge> : <Badge variant="red">{falseLabel}</Badge>
}

export const getApproveReturnColumns = (
  onRowAction: (data: AssetReturns) => void
): ColumnDef<AssetReturns>[] => [
  {
    accessorKey: "recid",
    header: () => null,
    cell: () => null,
  },
  makeSortableHeader("Request Time", "request_time"),
  makeSortableHeader("From", "from_empcode"),
  makeSortableHeader("Asset Code", "assetcode"),
  // makeSortableHeader("Remarks", "remarks_from"),
   {
    ...makeSortableHeader("Approval Status", "approve_status"),
    cell: ({ row }) => renderBooleanBadge(row.getValue("approve_status"), "Approved", "Rejected" ),
  },
  makeSortableHeader("Approved By", "approved_by"),
  makeSortableHeader("Approval time", "approved_at"),
  makeSortableHeader("Approval Remarks", "remarks"),
  {
  id: "actions",
  header: "Actions",
  cell: ({ row }) => {
    const action = row.original

    const [openDialog, setOpenDialog] = useState<"approve" | "reject" | null>(null)
    const [remark, setRemark] = useState("")

    const handleSubmit = async (status: "approve" | "reject") => {
    const apiUrl = `${apiURl}/manage-returns/approve-return/${action.recid}/${status === "approve" ? 1 : 0}`;

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ remarks: remark }),
      });

      if (!res.ok) {
        let errorMessage = "Failed to update return status";
        try {
          const errorData = await res.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          console.error("Failed to parse error JSON:", jsonError);
        }
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      toast.success(
        `Asset return ${status === "approve" ? "approved" : "rejected"} successfully`
      );
      setOpenDialog(null);

    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit. Please try again.");
    }
  };


    // ✅ Only render if approve_status is null
    if (action.approve_status !== null) return null

    return (
      <>
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
            <DropdownMenuItem onClick={() => setOpenDialog("approve")}>Approve Return</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenDialog("reject")}>Reject Return</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {openDialog && (
          <AlertDialog open={true} onOpenChange={() => setOpenDialog(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {openDialog === "approve" ? "Approve" : "Reject"} Asset Return
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Enter your remarks below:
                  <Input
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Enter remark"
                    className="mt-2"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleSubmit(openDialog)}>
                  Confirm {openDialog === "approve" ? "Approval" : "Rejection"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </>
    )
  },
}


] 
