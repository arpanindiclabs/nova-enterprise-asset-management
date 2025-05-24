import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const apiUrl = process.env.NEXT_PUBLIC_API_URL;


interface Employee {
  EmpNo: string;
  EmpName: string;
}

interface Company {
  CompCode: string;
  CompName: string;
}

interface Asset {
  AssetCode: string;
  AssetDescription: string;
  AssetType: string;
  VendorName: string;
}

interface FormValues {
  AssetCode: string;
  IssueDate: string;
  IssueType: string;
  IssueEmpno: string;
  IssueEmpName: string;
  IssueLocation: string;
  IssuedBy: string;
  Remarks1: string;
  Remarks2: string;
  ReturnDate: string;
  userCompany: string;
}

export function NewIssueForm() {
  const { register, handleSubmit, setValue, reset, watch } = useForm<FormValues>({
    defaultValues: {
      AssetCode: "",
      IssueDate: "",
      IssueType: "",
      IssueEmpno: "",
      IssueEmpName: "",
      IssueLocation: "",
      IssuedBy: sessionStorage.getItem("EmpNo")?.slice(1, -1) || "",
      Remarks1: "",
      Remarks2: "",
      ReturnDate: "",
      userCompany: "",
    },
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]); // State for assets
  const [openEmpPopover, setOpenEmpPopover] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/utils/get-employees`)
      .then((res) => res.json())
      .then((data) => setEmployees(data));

    fetch(`${apiUrl}/utils/get-companies`)
      .then((res) => res.json())
      .then((data) => setCompanies(data));

    // Fetch free assets data
    fetch(`${apiUrl}/utils/get-free-assets`)
      .then((res) => res.json())
      .then((data) => setAssets(data));
  }, []);

  useEffect(() => {
    const cookieData = Cookies.get("---");
    if (cookieData) {
      try {
        const parsed = JSON.parse(cookieData);
        reset({
          AssetCode: parsed.AssetCode ?? "",
          IssueDate: parsed.IssueDate ?? "",
          IssueType: parsed.IssueType ?? "",
          IssueEmpno: parsed.IssueEmpno ?? "",
          IssueEmpName: parsed.IssueEmpName ?? "",
          IssueLocation: parsed.IssueLocation ?? "",
          IssuedBy: parsed.IssuedBy ?? "",
          Remarks1: parsed.Remarks1 ?? "",
          Remarks2: parsed.Remarks2 ?? "",
          ReturnDate: parsed.ReturnDate ?? "",
          userCompany: parsed.userCompany ?? "",
        });
      } catch (e) {
        console.error("Invalid cookie format", e);
      }
    }
  }, [reset]);

  const onSubmit = async (data: FormValues) => {
    // Log the form data when the form is submitted
    console.log("Submitted form data:", data);
  
    // Prepare the POST request to send data to the backend
    try {
      const response = await fetch(`${apiUrl}/manage-issue-register/add-issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // Send the form data as JSON
      });
  
      // Check if the response is ok (status 200-299)
      if (!response.ok) {
        throw new Error("Failed to submit form");
      }
  
      const result = await response.json();
      console.log("Response from server:", result);
  
      // Handle success (e.g., show a success message)
      Cookies.remove("addModalOpen");
      toast("Asset issue recorded successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error (e.g., show an error message)
      toast("An error occurred while submitting the form.");
    }
  };

  const selectedEmpNo = watch("IssueEmpno");

  useEffect(() => {
    const matched = employees.find(
      (emp) => emp.EmpNo.trim() === selectedEmpNo.trim()
    );
    if (matched) {
      setValue("IssueEmpName", matched.EmpName);
    }
  }, [selectedEmpNo, employees, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">New Issue</h2>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details below to issue an asset to an employee.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block mb-1 text-sm text-gray-700">Asset Code</label>
          {assets && assets.length > 0 ? (
            <select
              {...register("AssetCode")}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select asset</option>
              {assets.map((asset) => (
                <option key={asset.AssetCode} value={asset.AssetCode}>
                  {asset.AssetCode.trim()} - {asset.AssetDescription || "No description"}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-red-500">No free assets found</div>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Issue Date</label>
          <Input type="date" {...register("IssueDate")} />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Issue Type</label>
          <Select onValueChange={(value) => setValue("IssueType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select issue type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Temporary">Temporary</SelectItem>
              <SelectItem value="Permanent">Permanent</SelectItem>
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block mb-1 text-sm text-gray-700">Employee</label>
          <Popover open={openEmpPopover} onOpenChange={setOpenEmpPopover}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full px-3 py-2 border rounded text-left bg-white hover:border-blue-500"
              >
                {selectedEmpNo
                  ? `${selectedEmpNo.trim()} - ${employees.find(emp => emp.EmpNo.trim() === selectedEmpNo.trim())?.EmpName ?? ""}`
                  : "Select employee..."}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search employee..." />
                <CommandList>
                  {employees.map((emp) => (
                    <CommandItem
                      key={emp.EmpNo}
                      value={`${emp.EmpNo} ${emp.EmpName}`}
                      onSelect={() => {
                        setValue("IssueEmpno", emp.EmpNo);
                        setOpenEmpPopover(false);
                      }}
                    >
                      {emp.EmpNo.trim()} - {emp.EmpName}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Employee Name</label>
          <Input {...register("IssueEmpName")} placeholder="Full name" disabled />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Issue Location</label>
          <Input {...register("IssueLocation")} placeholder="Enter issue location" />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Issued By</label>
          <Input disabled {...register("IssuedBy")} placeholder="Issuer's name" />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Return Date</label>
          <Input type="date" {...register("ReturnDate")} />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Company</label>
          <select
            {...register("userCompany")}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select company</option>
            {companies.map((comp) => (
              <option key={comp.CompCode} value={comp.CompCode}>
                {comp.CompName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block mb-1 text-sm text-gray-700">Remarks 1</label>
          <Textarea {...register("Remarks1")} placeholder="e.g. Reason for issuing asset..." />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-700">Remarks 2</label>
          <Textarea {...register("Remarks2")} placeholder="Additional notes..." />
        </div>
      </div>

      <div className="pt-4 text-left">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-md text-sm font-medium"
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
