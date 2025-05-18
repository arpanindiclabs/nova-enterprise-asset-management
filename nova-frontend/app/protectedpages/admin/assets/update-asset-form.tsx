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

  // 1) Set default form values from cookie if missing
  useEffect(() => {
    if (parsed.CurrentEmpNo && !purchaseEmpNo) {
      setValue("PurchaseEmployeeName", parsed.CurrentEmpNo);
    }
    if (parsed.UserCompany && !userCompany) {
      setValue("UserCompany", parsed.UserCompany);
    }
    if (parsed.OwnerCompany && !ownerCompany) {
      setValue("OwnerCompany", parsed.OwnerCompany);
    }
  }, [parsed, purchaseEmpNo, userCompany, ownerCompany, setValue]);

  // 2) Fetch employees and companies on mount
  useEffect(() => {
    fetch(`${apiUrl}/utils/get-employees`)
      .then((res) => res.json())
      .then((data) => setEmployees(data));

    fetch(`${apiUrl}/utils/get-companies`)
      .then((res) => res.json())
      .then((data) => setCompanies(data));
  }, []);

  // For popovers
  const [openOwnerCompanyPopover, setOpenOwnerCompanyPopover] = useState(false);
  const [openUserCompanyPopover, setOpenUserCompanyPopover] = useState(false);
  const [openCurrentEmpPopover, setOpenCurrentEmpPopover] = useState(false);

  // Selected values watched for display
  const selectedOwnerCompany = watch("OwnerCompany");
  const selectedUserCompany = watch("UserCompany");
  const selectedCurrentEmpNo = watch("CurrentEmpNo");

  const onSubmit = async (data: AssetFormValues) => {
    const token = sessionStorage.getItem("token");
    const assetCode = data.AssetCode;
    console.log(data);

    if (!token || !assetCode) {
      toast.error("Missing token or Asset Code");
      return;
    }

    try {
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

      const result = await response.json();

      if (response.ok) {
        toast.success("Asset updated successfully", {
          description: JSON.stringify(result),
        });
      } else {
        toast.error("Update failed", {
          description: result?.message || "An error occurred",
        });
      }
    } catch (error: any) {
      toast.error("Unexpected error", {
        description: error?.message || "Something went wrong",
      });
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
          <Checkbox {...register("IsIssued")} />
          <label>Is Issued</label>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox {...register("IsActive")} />
          <label>Is Active</label>
        </div>
        <div className="flex items-center space-x-3">
          <Checkbox {...register("IsScrraped")} />
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
