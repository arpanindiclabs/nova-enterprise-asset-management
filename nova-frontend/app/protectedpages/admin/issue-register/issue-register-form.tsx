import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner"

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


interface Employee {
  EmpNo: string;
  EmpName: string;
}

interface Company {
  CompCode: string;
  CompName: string;
}

interface FormValues {
  IssuedID: string;
  AssetCode: string;
  IssueDate: string;
  IssueType: string;
  IssueEmpno: string;
  IssueEmpName: string;
  IssueLocation: string;
  IssueStatus: boolean;
  ReturenStatus: boolean;
  IssuedBy: string;
  Remarks1: string;
  Remarks2: string;
  ReturnDate: string;
  userCompany: string;
}

export function IssueForm() {
  const { register, handleSubmit, setValue, reset, watch } = useForm<FormValues>({
    defaultValues: {
      IssuedID: "",
      AssetCode: "",
      IssueDate: "",
      IssueType: "",
      IssueEmpno: "",
      IssueEmpName: "",
      IssueLocation: "",
      IssueStatus: false,
      ReturenStatus: false,
      IssuedBy: "",
      Remarks1: "",
      Remarks2: "",
      ReturnDate: "",
      userCompany: "",
    },
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [openEmpPopover, setOpenEmpPopover] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/utils/get-employees`)
      .then((res) => res.json())
      .then((data) => setEmployees(data));

    fetch(`${apiUrl}/utils/get-companies`)
      .then((res) => res.json())
      .then((data) => setCompanies(data));
  }, []);

  useEffect(() => {
    const cookieData = Cookies.get("selected");
    if (cookieData) {
      try {
        const parsed = JSON.parse(cookieData);
        reset({
          IssuedID: parsed.IssuedID ?? "",
          AssetCode: parsed.AssetCode ?? "",
          IssueDate: parsed.IssueDate ?? "",
          IssueType: parsed.IssueType ?? "",
          IssueEmpno: parsed.IssueEmpno ?? "",
          IssueEmpName: parsed.IssueEmpName ?? "",
          IssueLocation: parsed.IssueLocation ?? "",
          IssueStatus: parsed.IssueStatus === 1,
          ReturenStatus: parsed.ReturenStatus === 1,
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
    try {
      const { IssuedID, ...updateData } = data; // Remove IssuedID from the body as it's in the URL
  
  
      const token = sessionStorage.getItem("token");
      if (!token) {
        return toast("You need to be logged in to update the issue record.");
      }
// Log the data being sent to the server
      const response = await fetch(`${apiUrl}/manage-issue-register/update-issue/${IssuedID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add the token to the Authorization header
        },
        body: JSON.stringify(updateData),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }
  
      // Handle the success scenario (e.g., show a success message)
      Cookies.remove("editModalOpen");
      toast('Issue record updated successfully');
      console.log('Updated data:', result);
      // You can reset the form if needed
      reset();
    } catch (err) {
      console.error('Error updating issue:', err);
      toast('Error updating issue: ' + err.message);
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
        <h2 className="text-2xl font-semibold text-gray-800">Update Asset Issue Form</h2>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details below to issue an asset to an employee.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* IssuedID Field */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Issued ID</label>
          <Input {...register("IssuedID")} disabled  />
        </div>

        {/* Asset Code Field */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Asset Code</label>
          <Input {...register("AssetCode")} disabled  />
        </div>

        {/* Issue Date Field */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Issue Date</label>
          <Input type="date" {...register("IssueDate")} />
        </div>

        {/* Issue Type Field */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Issue Type</label>
          <Input {...register("IssueType")} placeholder="e.g. Temporary" />
        </div>

        {/* Employee Select Section */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Employee</label>
          <Popover open={openEmpPopover} onOpenChange={setOpenEmpPopover}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full px-3 py-2 border rounded text-left bg-white hover:border-blue-500"
              >
                {
                  selectedEmpNo
                    ? `${selectedEmpNo.trim()} - ${employees.find(emp => emp.EmpNo.trim() === selectedEmpNo.trim())?.EmpName ?? ""}`
                    : "Select employee..."
                }
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

        {/* Employee Name (Auto-filled based on selected EmpNo) */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Employee Name</label>
          <Input {...register("IssueEmpName")} placeholder="Full name" disabled />
        </div>

        {/* Issue Location Field */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Issue Location</label>
          <Input {...register("IssueLocation")} placeholder="Enter issue location" />
        </div>

        {/* Issued By Field */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Issued By</label>
          <Input {...register("IssuedBy")} placeholder="Issuer's name" />
        </div>

        {/* Return Date Field */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Return Date</label>
          <Input type="date" {...register("ReturnDate")} />
        </div>

        {/* Company Select Field */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Issue Status Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox id="IssueStatus" {...register("IssueStatus")} />
          <label htmlFor="IssueStatus" className="text-sm text-gray-700">Issue Status</label>
        </div>

        {/* Return Status Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox id="ReturenStatus" {...register("ReturenStatus")} />
          <label htmlFor="ReturenStatus" className="text-sm text-gray-700">Return Status</label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Remarks 1 Field */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Remarks 1</label>
          <Textarea {...register("Remarks1")} placeholder="e.g. Reason for issuing asset..." />
        </div>

        {/* Remarks 2 Field */}
        <div>
          <label className="block mb-1 text-sm text-gray-700">Remarks 2</label>
          <Textarea {...register("Remarks2")} placeholder="Additional notes..." />
        </div>
      </div>

      {/* Submit Button */}
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
