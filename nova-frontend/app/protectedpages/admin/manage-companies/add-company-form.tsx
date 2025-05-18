import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

type CompanyFormValues = {
  CompCode: string;
  CompName: string;
};

const CompanyForm = () => {
  const modalType = Cookies.get('modalType'); // 'add' or "edit"
  const cookieData = Cookies.get('selected');
  const parsed = cookieData && modalType == 'edit' ? JSON.parse(cookieData) : {};

  const { register, handleSubmit } = useForm<CompanyFormValues>({
    defaultValues: modalType == "edit"
      ? {
          CompCode: parsed.CompCode ?? '',
          CompName: parsed.CompName ?? '',
        }
      : {
          CompCode: '',
          CompName: '',
        },
  });

 const onSubmit = async (data: CompanyFormValues) => {
  const modalType = Cookies.get("modalType");
  const token = sessionStorage.getItem("token");

  if (!token) {
    toast.error("Authentication token missing");
    return;
  }

  try {
    const isEdit = modalType === "edit";
    const selected = Cookies.get("selected");
    const parsed = selected ? JSON.parse(selected) : null;

    const url = isEdit
      ? `http://localhost:4000/manage-company/update-company/${parsed?.CompCode}`
      : "http://localhost:4000/manage-company/add-company";

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      const errorMsg = result?.errors?.[0]?.msg || result.message || "Unknown error";
      throw new Error(errorMsg);
    }

    toast.success(`${isEdit ? "Updated" : "Added"} company successfully`, {
      description: JSON.stringify(data),
    });

    // Optional: refresh page or close modal
  } catch (err: any) {
    console.error(`${modalType} company error:`, err);
    toast.error(`Failed to ${modalType === "edit" ? "update" : "add"} company`, {
      description: err.message || "Internal error",
    });
  }
};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">
        {modalType == "edit" ? 'Update Company' : 'Add New Company'}
      </h2>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm text-gray-600 block mb-1">Company Code</label>
          <Input
            {...register('CompCode')}
            disabled={modalType == "edit"}
            
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Company Name</label>
          <Input
            {...register('CompName')}
            placeholder="Enter company name"
          />
        </div>
      </div>

      <div className="text-right pt-4">
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
          {modalType == "edit" ? 'Save Changes' : 'Add Company'}
        </Button>
      </div>
    </form>
  );
};

export default CompanyForm;
