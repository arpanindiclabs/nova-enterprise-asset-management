import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";

interface Company {
  CompCode: string;
  CompName: string;
}

interface Employee {
  EmpNo: string;
  EmpName: string;
}

type AssetFormValues = {
  AssetCode: string | null;
  AssetERP_Code: string | null;
  AssetType: string | null;
  AssetDescription: string | null;
  PurchaseDate: string | null;
  OwnerCompany: string | null;
  PurchaseEmployeeName: string | null;
  PoNo: string | null;
  PoDate: string | null;
  PurchasedPrice: number | null;
  VendorName: string | null;
  WarrantyDate: string | null;
  IsIssued: number | null;
  UserContNo: string | null;
  UserCompany: string | null;
  IssuedDate: string | null;
  IssuedSite: string | null;
  IsActive: number | null;
  IsScrraped: number | null;
  ScrapedDate: string | null;
  Remarks1: string | null;
  Remarks2: string | null;
  Remarks3: string | null;
  AssetBrand: string | null;
  AssetModel: string | null;
  AssetSlno: string | null;
  Location: string | null;
  CurrentEmpNo: string | null;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const UpdateAssetForm = () => {
  const cookieData = Cookies.get("selected");
  const parsed = cookieData ? JSON.parse(cookieData) : {};

  // Console log initial data from cookies
  console.log("=== COMPONENT INITIALIZATION ===");
  console.log("Cookie data:", cookieData);
  console.log("Parsed cookie data:", parsed);
  console.log("Parsed data keys:", Object.keys(parsed));
  console.log("Parsed data values:", Object.values(parsed));

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<AssetFormValues>({
    defaultValues: {
      AssetCode: parsed.AssetCode ?? null,
      AssetERP_Code: parsed.AssetERP_Code ?? null,
      AssetType: parsed.AssetType ?? null,
      AssetDescription: parsed.AssetDescription ?? null,
      PurchaseDate: parsed.PurchaseDate ?? null,
      OwnerCompany: parsed.OwnerCompany ?? null,
      PurchaseEmployeeName: parsed.PurchaseEmployeeName ?? null,
      PoNo: parsed.PoNo ?? null,
      PoDate: parsed.PoDate ?? null,
      PurchasedPrice: parsed.PurchasedPrice ?? null,
      VendorName: parsed.VendorName ?? null,
      WarrantyDate: parsed.WarrantyDate ?? null,
      IsIssued: parsed.IsIssued ?? 0,
      UserContNo: parsed.UserContNo ?? null,
      UserCompany: parsed.UserCompany ?? null,
      IssuedDate: parsed.IssuedDate ?? null,
      IssuedSite: parsed.IssuedSite ?? null,
      IsActive: parsed.IsActive ?? 1,
      IsScrraped: parsed.IsScrraped ?? 0,
      ScrapedDate: parsed.ScrapedDate ?? null,
      Remarks1: parsed.Remarks1 ?? null,
      Remarks2: parsed.Remarks2 ?? null,
      Remarks3: parsed.Remarks3 ?? null,
      AssetBrand: parsed.AssetBrand ?? null,
      AssetModel: parsed.AssetModel ?? null,
      AssetSlno: parsed.AssetSlno ?? null,
      Location: parsed.Location ?? null,
      CurrentEmpNo: parsed.CurrentEmpNo ?? null,
    },
  });

  // Watch dependent fields for default value effect
  const purchaseEmpNo = watch("PurchaseEmployeeName");
  const userCompany = watch("UserCompany");
  const ownerCompany = watch("OwnerCompany");

  // Console log watch values changes
  console.log("=== WATCH VALUES ===");
  console.log("Purchase Employee Name:", purchaseEmpNo);
  console.log("User Company:", userCompany);
  console.log("Owner Company:", ownerCompany);

  // 1) Set default form values from cookie if missing
  useEffect(() => {
    console.log("=== SETTING DEFAULT VALUES ===");
    console.log("Checking CurrentEmpNo:", parsed.CurrentEmpNo, "vs purchaseEmpNo:", purchaseEmpNo);
    console.log("Checking UserCompany:", parsed.UserCompany, "vs userCompany:", userCompany);
    console.log("Checking OwnerCompany:", parsed.OwnerCompany, "vs ownerCompany:", ownerCompany);
    
    if (parsed.CurrentEmpNo && !purchaseEmpNo) {
      console.log("Setting PurchaseEmployeeName to:", parsed.CurrentEmpNo);
      setValue("PurchaseEmployeeName", parsed.CurrentEmpNo);
    }
    if (parsed.UserCompany && !userCompany) {
      console.log("Setting UserCompany to:", parsed.UserCompany);
      setValue("UserCompany", parsed.UserCompany);
    }
    if (parsed.OwnerCompany && !ownerCompany) {
      console.log("Setting OwnerCompany to:", parsed.OwnerCompany);
      setValue("OwnerCompany", parsed.OwnerCompany);
    }
  }, [parsed, purchaseEmpNo, userCompany, ownerCompany, setValue]);

  // 2) Fetch employees and companies on mount
  useEffect(() => {
    console.log("=== FETCHING EMPLOYEES AND COMPANIES ===");
    console.log("API URL:", apiUrl);
    
    fetch(`${apiUrl}/utils/get-employees`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Employees fetched:", data);
        console.log("Number of employees:", data.length);
        setEmployees(data);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
      });

    fetch(`${apiUrl}/utils/get-companies`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Companies fetched:", data);
        console.log("Number of companies:", data.length);
        setCompanies(data);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
      });
  }, []);

  // For popovers
  const [openOwnerCompanyPopover, setOpenOwnerCompanyPopover] = useState(false);
  const [openUserCompanyPopover, setOpenUserCompanyPopover] = useState(false);
  const [openCurrentEmpPopover, setOpenCurrentEmpPopover] = useState(false);

  // Selected values watched for display
  const selectedOwnerCompany = watch("OwnerCompany");
  const selectedUserCompany = watch("UserCompany");
  const selectedCurrentEmpNo = watch("CurrentEmpNo");

  // Console log selected values
  console.log("=== SELECTED VALUES ===");
  console.log("Selected Owner Company:", selectedOwnerCompany);
  console.log("Selected User Company:", selectedUserCompany);
  console.log("Selected Current Employee:", selectedCurrentEmpNo);

  const onSubmit = async (data: AssetFormValues) => {
    // Console logging BEFORE form submission
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form submission timestamp:", new Date().toISOString());
    console.log("Raw form data received:", data);
    console.log("Form data keys:", Object.keys(data));
    console.log("Form data values:", Object.values(data));
    
    // Log specific important fields
    console.log("Asset Code:", data.AssetCode);
    console.log("Asset Description:", data.AssetDescription);
    console.log("Asset Type:", data.AssetType);
    console.log("Current Employee:", data.CurrentEmpNo);
    console.log("Owner Company:", data.OwnerCompany);
    console.log("User Company:", data.UserCompany);
    console.log("Is Issued:", data.IsIssued, "Type:", typeof data.IsIssued);
    console.log("Is Active:", data.IsActive, "Type:", typeof data.IsActive);
    console.log("Is Scrapped:", data.IsScrraped, "Type:", typeof data.IsScrraped);

    const token = sessionStorage.getItem("token");
    const assetCode = data.AssetCode;
    
    // Log authentication and validation
    console.log("Authentication token exists:", !!token);
    console.log("Asset code exists:", !!assetCode);
    console.log("Token preview:", token ? `${token.substring(0, 20)}...` : "No token");

    if (!token || !assetCode) {
      console.error("❌ VALIDATION FAILED - Missing token or Asset Code");
      console.log("Token missing:", !token);
      console.log("Asset code missing:", !assetCode);
      toast.error("Missing token or Asset Code");
      return;
    }

    // Console logging DURING form submission
    console.log("✅ VALIDATION PASSED - Proceeding with submission");
    console.log("API URL:", `${apiUrl}/manage-asset/update-asset/${assetCode}`);
    console.log("Request method: PUT");
    console.log("Request headers:", {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token.substring(0, 20)}...`
    });
    console.log("Request body:", JSON.stringify(data, null, 2));

    try {
      console.log("🚀 SENDING REQUEST TO SERVER...");
      const requestStartTime = Date.now();
      
      const response = await fetch(
        `${apiUrl}/manage-asset/update-asset/${assetCode}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const requestEndTime = Date.now();
      const requestDuration = requestEndTime - requestStartTime;
      
      console.log("📡 RESPONSE RECEIVED");
      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      console.log("Request duration:", `${requestDuration}ms`);

      const result = await response.json();
      console.log("Response body:", result);

      if (response.ok) {
        console.log("✅ UPDATE SUCCESSFUL");
        console.log("Success response:", result);
        toast.success("Asset updated successfully", {
          description: JSON.stringify(result),
        });
      } else {
        console.error("❌ UPDATE FAILED");
        console.error("Error response:", result);
        console.error("Error message:", result?.message || "An error occurred");
        toast.error("Update failed", {
          description: result?.message || "An error occurred",
        });
      }
    } catch (error: any) {
      console.error("💥 UNEXPECTED ERROR DURING SUBMISSION");
      console.error("Error type:", typeof error);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      console.error("Full error object:", error);
      toast.error("Unexpected error", {
        description: error?.message || "Something went wrong",
      });
    } finally {
      console.log("=== FORM SUBMISSION COMPLETED ===");
      console.log("Submission end timestamp:", new Date().toISOString());
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">
        Update Asset Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Regular text inputs */}
        {[
          "AssetCode",
          "AssetERP_Code",
          "AssetType",
          "AssetDescription",
          "PoNo",
          "VendorName",
          "UserContNo",
          "IssuedSite",
          "Remarks1",
          "Remarks2",
          "Remarks3",
          "AssetBrand",
          "AssetModel",
          "AssetSlno",
          "Location",
          "PurchaseEmployeeName", // plain input, no dropdown
        ].map((field) => (
          <div key={field}>
            <label className="text-sm text-gray-600 mb-1 block">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <Input {...register(field as keyof AssetFormValues)} />
          </div>
        ))}

        {/* OwnerCompany combobox */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Owner Company</label>
          <Popover
            open={openOwnerCompanyPopover}
            onOpenChange={setOpenOwnerCompanyPopover}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full px-3 py-2 border rounded text-left bg-white hover:border-blue-500"
              >
                {selectedOwnerCompany
                  ? companies.find((c) => c.CompCode === selectedOwnerCompany)
                      ?.CompName ?? selectedOwnerCompany
                  : "Select Owner Company..."}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search company..." />
                <CommandList>
                  {companies.map((comp) => (
                    <CommandItem
                      key={comp.CompCode}
                      value={comp.CompCode}
                      onSelect={() => {
                        console.log("Owner Company selected:", comp.CompCode, "-", comp.CompName);
                        setValue("OwnerCompany", comp.CompCode);
                        setOpenOwnerCompanyPopover(false);
                      }}
                    >
                      {comp.CompCode} - {comp.CompName}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* UserCompany combobox */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">User Company</label>
          <Popover
            open={openUserCompanyPopover}
            onOpenChange={setOpenUserCompanyPopover}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full px-3 py-2 border rounded text-left bg-white hover:border-blue-500"
              >
                {selectedUserCompany
                  ? companies.find((c) => c.CompCode === selectedUserCompany)
                      ?.CompName ?? selectedUserCompany
                  : "Select User Company..."}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search company..." />
                <CommandList>
                  {companies.map((comp) => (
                    <CommandItem
                      key={comp.CompCode}
                      value={comp.CompCode}
                      onSelect={() => {
                        console.log("User Company selected:", comp.CompCode, "-", comp.CompName);
                        setValue("UserCompany", comp.CompCode);
                        setOpenUserCompanyPopover(false);
                      }}
                    >
                      {comp.CompCode} - {comp.CompName}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* CurrentEmpNo combobox */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Current Employee</label>
          <Popover
            open={openCurrentEmpPopover}
            onOpenChange={setOpenCurrentEmpPopover}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full px-3 py-2 border rounded text-left bg-white hover:border-blue-500"
              >
                {selectedCurrentEmpNo
                  ? employees.find((e) => e.EmpNo === selectedCurrentEmpNo)
                      ?.EmpName ?? selectedCurrentEmpNo
                  : "Select Employee..."}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search employee..." />
                <CommandList>
                  {employees.map((emp) => (
                    <CommandItem
                      key={emp.EmpNo}
                      value={emp.EmpNo}
                      onSelect={() => {
                        console.log("Current Employee selected:", emp.EmpNo, "-", emp.EmpName);
                        setValue("CurrentEmpNo", emp.EmpNo);
                        setOpenCurrentEmpPopover(false);
                      }}
                    >
                      {emp.EmpNo} - {emp.EmpName}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Date inputs */}
        {[
          "PurchaseDate",
          "PoDate",
          "WarrantyDate",
          "IssuedDate",
          "ScrapedDate",
        ].map((field) => (
          <div key={field}>
            <label className="block mb-1 text-sm text-gray-700">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <Input
              type="date"
              {...register(field as keyof AssetFormValues)}
            />
          </div>
        ))}

        {/* Numeric input */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Purchased Price</label>
          <Input
            type="number"
            step="0.01"
            {...register("PurchasedPrice")}
          />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center space-x-3">
          <Checkbox 
            checked={watch("IsIssued") === 1}
            onCheckedChange={(checked) => {
              console.log("IsIssued checkbox changed:", checked);
              setValue("IsIssued", checked ? 1 : 0);
            }}
          />
          <label>Is Issued</label>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox 
            checked={watch("IsActive") === 1}
            onCheckedChange={(checked) => {
              console.log("IsActive checkbox changed:", checked);
              setValue("IsActive", checked ? 1 : 0);
            }}
          />
          <label>Is Active</label>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox 
            checked={watch("IsScrraped") === 1}
            onCheckedChange={(checked) => {
              console.log("IsScrraped checkbox changed:", checked);
              setValue("IsScrraped", checked ? 1 : 0);
            }}
          />
          <label>Is Scrapped</label>
        </div>
      </div>

      <Button type="submit" className="mt-4">
        Update Asset
      </Button>
    </form>
  );
};

export default UpdateAssetForm;
