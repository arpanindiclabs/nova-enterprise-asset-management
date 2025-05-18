import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import Cookies from 'js-cookie';

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
  const cookieData = Cookies.get('selected');
  const parsed = cookieData ? JSON.parse(cookieData) : {};

  const { register, handleSubmit, setValue, watch } = useForm<AssetFormValues>({
    defaultValues: {
      AssetCode: parsed.AssetCode ?? '',
      AssetERP_Code: parsed.AssetERP_Code ?? '',
      AssetType: parsed.AssetType ?? '',
      AssetDescription: parsed.AssetDescription ?? '',
      PurchaseDate: parsed.PurchaseDate ?? '',
      OwnerCompany: parsed.OwnerCompany ?? '',
      PurchaseEmployeeName: parsed.PurchaseEmployeeName ?? '',
      PoNo: parsed.PoNo ?? '',
      PoDate: parsed.PoDate ?? '',
      PurchasedPrice: parsed.PurchasedPrice ?? 0,
      VendorName: parsed.VendorName ?? '',
      WarrantyDate: parsed.WarrantyDate ?? '',
      IsIssued: parsed.IsIssued ?? 0,
      UserContNo: parsed.UserContNo ?? '',
      UserCompany: parsed.UserCompany ?? '',
      IssuedDate: parsed.IssuedDate ?? '',
      IssuedSite: parsed.IssuedSite ?? '',
      IsActive: parsed.IsActive ?? 1,
      IsScrraped: parsed.IsScrraped ?? false,
      ScrapedDate: parsed.ScrapedDate ?? '',
      Remarks1: parsed.Remarks1 ?? '',
      Remarks2: parsed.Remarks2 ?? '',
      Remarks3: parsed.Remarks3 ?? '',
      AssetBrand: parsed.AssetBrand ?? '',
      AssetModel: parsed.AssetModel ?? '',
      AssetSlno: parsed.AssetSlno ?? '',
      Location: parsed.Location ?? '',
      CurrentEmpNo: parsed.CurrentEmpNo ?? '',
    },
  });

  const onSubmit = async (data: AssetFormValues) => {
    const token = sessionStorage.getItem("token");
    const assetCode = data.AssetCode;
    console.log(data);

    if (!token || !assetCode) {
      toast.error("Missing token or Asset Code");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/manage-asset/update-asset/${assetCode}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

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
      <h2 className="text-2xl font-semibold text-gray-800">Update Asset Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          'AssetCode', 'AssetERP_Code', 'AssetType', 'AssetDescription', 'OwnerCompany', 'PurchaseEmployeeName',
          'PoNo', 'VendorName', 'UserContNo', 'UserCompany', 'IssuedSite', 'Remarks1', 'Remarks2', 'Remarks3',
          'AssetBrand', 'AssetModel', 'AssetSlno', 'Location', 'CurrentEmpNo'
        ].map((field) => (
          <div key={field}>
            <label className="text-sm text-gray-600 mb-1 block">{field.replace(/([A-Z])/g, ' $1')}</label>
            <Input {...register(field as keyof AssetFormValues)} />
          </div>
        ))}

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Purchase Date</label>
          <Input {...register("PurchaseDate")} type="date" />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Po Date</label>
          <Input {...register("PoDate")} type="date" />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Purchased Price</label>
          <Input {...register("PurchasedPrice", { valueAsNumber: true })} type="number" step="0.01" />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Warranty Date</label>
          <Input {...register("WarrantyDate")} type="date" />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Issued Date</label>
          <Input {...register("IssuedDate")} type="date" />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Scraped Date</label>
          <Input {...register("ScrapedDate")} type="date" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="IsActive"
            checked={watch('IsActive') === 1}
            onCheckedChange={(val) => setValue('IsActive', val ? 1 : 0)}
          />
          <label htmlFor="IsActive" className="text-sm text-gray-700">Active</label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="IsIssued"
            checked={watch('IsIssued') === 1}
            onCheckedChange={(val) => setValue('IsIssued', val ? 1 : 0)}
          />
          <label htmlFor="IsIssued" className="text-sm text-gray-700">Issued</label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="IsScrraped"
            checked={watch('IsScrraped') === 1}
            onCheckedChange={(val) => setValue('IsScrraped', val ? 1 : 0)}
          />
          <label htmlFor="IsScrraped" className="text-sm text-gray-700">Scrapped</label>
        </div>
      </div>

      <div className="text-right pt-4">
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default UpdateAssetForm;
