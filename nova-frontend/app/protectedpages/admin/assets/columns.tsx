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


export type AssetIssue = {
  AssetRecID: number | null
  AssetCode: string | null
  AssetERP_Code: string | null
  AssetType: string | null
  AssetDescription: string | null
  PurchaseDate: string | null
  OwnerCompany: string | null
  PurchaseEmployeeName: string | null
  PoNo: string | null
  PoDate: string | null
  PurchasedPrice: number | null
  VendorName: string | null
  WarrantyDate: string | null
  IsIssued: number | boolean | null // 1/true for issued, 0/false for not issued, NULL for unknown
  UserContNo: string | null
  UserCompany: string | null
  IssuedDate: string | null
  IssuedSite: string | null
  IsActive: number | boolean | null // 1/true for active, 0/false for inactive, NULL for unknown
  IsScrraped: number | boolean | null // 1/true for scrapped, 0/false for not scrapped, NULL for unknown
  ScrappedDate: string | null
  Remarks1: string | null
  Remarks2: string | null
  Remarks3: string | null
  AssetBrand: string | null
  AssetModel: string | null
  AssetSlno: string | null
  Location: string | null
  CurrentEmpNo: string | null
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

// Helper function to render badges for boolean values
const renderBooleanBadge = (value: number | boolean | null, trueLabel: string, falseLabel: string) => {
  if (value === null || value === undefined) return <Badge variant="secondary">N/A</Badge>
  
  // Handle both boolean (true/false) and number (1/0) values
  const isTrue = value === true || value === 1;
  
  return isTrue ? (
    <Badge variant="default">{trueLabel}</Badge>
  ) : (
    <Badge variant="destructive">{falseLabel}</Badge>
  );
}

export const getColumns = (
  onRowAction: (data: AssetIssue) => void
): ColumnDef<AssetIssue>[] => [
  makeSortableHeader("Asset Code", "AssetCode"),
  makeSortableHeader("Asset ERP Code", "AssetERP_Code"),
  makeSortableHeader("Asset Type", "AssetType"),
  makeSortableHeader("Asset Description", "AssetDescription"),
  makeSortableHeader("Purchase Date", "PurchaseDate"),
  makeSortableHeader("Purchase Employee Name", "PurchaseEmployeeName"),
  makeSortableHeader("Po No", "PoNo"),
  makeSortableHeader("Po Date", "PoDate"),
  makeSortableHeader("Purchased Price", "PurchasedPrice"),
  makeSortableHeader("Vendor Name", "VendorName"),
  makeSortableHeader("Warranty Date", "WarrantyDate"),
  {
    ...makeSortableHeader("Is Issued", "IsIssued"),
    cell: ({ row }) => renderBooleanBadge(row.getValue("IsIssued"), "Issued", "Not Issued"),
  },
  makeSortableHeader("User Contact No.", "UserContNo"),
  makeSortableHeader("User Company", "UserCompany"),
  makeSortableHeader("Issued Date", "IssuedDate"),
  makeSortableHeader("Issued Site", "IssuedSite"),
  {
    ...makeSortableHeader("Is Active", "IsActive"),
    cell: ({ row }) => renderBooleanBadge(row.getValue("IsActive"), "Active", "Inactive"),
  },
  {
    ...makeSortableHeader("Is Scrapped", "IsScrraped"),
    cell: ({ row }) => renderBooleanBadge(row.getValue("IsScrraped"), "Scrapped", "Not Scrapped"),
  },
  makeSortableHeader("Scrapped Date", "ScrappedDate"),
  makeSortableHeader("Remarks 1", "Remarks1"),
  makeSortableHeader("Remarks 2", "Remarks2"),
  makeSortableHeader("Remarks 3", "Remarks3"),
  makeSortableHeader("Asset Brand", "AssetBrand"),
  makeSortableHeader("Asset Model", "AssetModel"),
  makeSortableHeader("Asset Serial No.", "AssetSlno"),
  makeSortableHeader("Location", "Location"),
  makeSortableHeader("Current Employee No.", "CurrentEmpNo"),
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const assetIssue = row.original
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
            <DropdownMenuItem className="text-grey" onClick={() => onRowAction(assetIssue)}>
              Modify
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]