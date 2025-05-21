import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Cookies from 'js-cookie';
import { toast } from "sonner"
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type UserFormValues = {
  EmpNo: string | null;
  EmpName: string | null;
  EmpCompID: string | null;
  EmpDeptID: string | null;
  EmpContNo: string | null;
  IsActive: number | null;
  Username: string | null;
  Password: string | null;
  LastLogin: string | null;
  LastLocation: string | null;
  IsAdmin: number | null;
};

const UpdateUserForm = () => {
  const cookieData = Cookies.get('selected');
  const parsed = cookieData ? JSON.parse(cookieData) : {};

  const { register, handleSubmit, setValue, watch } = useForm<UserFormValues>({
    defaultValues: {
      EmpNo: parsed.EmpNo ?? '',
      EmpName: parsed.EmpName ?? '',
      EmpCompID: parsed.EmpCompID ?? '',
      EmpDeptID: parsed.EmpDeptID ?? '',
      EmpContNo: parsed.EmpContNo ?? '',
      IsActive: parsed.IsActive ?? 0,
      Username: parsed.Username ?? '',
      Password: parsed.Password ?? '',
      LastLogin: parsed.LastLogin ?? '',
      LastLocation: parsed.LastLocation ?? '',
      IsAdmin: parsed.IsAdmin ?? 0,
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    const token = sessionStorage.getItem("token")
    const empNo = data.EmpNo
  
    if (!token || !empNo) {
      toast.error("Missing token or EmpNo")
      return
    }
  
    try {
      const response = await fetch(`${apiUrl}/manage-user/update-user/${empNo}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
  
      const result = await response.json()
      console.log(result)
  
      if (response.ok) {
        toast.success("User updated successfully!", {
          description: JSON.stringify(result),
        })
      } else {
        toast.error("Update failed", {
          description: result?.message || "An error occurred",
        })
      }
    } catch (error: any) {
      toast.error("Unexpected error", {
        description: error?.message || "Something went wrong",
      })
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-2xl font-semibold text-gray-800">Update Employee Details</CardTitle>
        <p className="text-gray-500 text-sm">Edit or update employee profile below.</p>
      </div>
      
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Employee No</label>
              <Input {...register('EmpNo')} disabled />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Name</label>
              <Input {...register('EmpName')} />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Company ID</label>
              <Input {...register('EmpCompID')} />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Department ID</label>
              <Input {...register('EmpDeptID')} />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Contact Number</label>
              <Input {...register('EmpContNo')} />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Username</label>
              <Input {...register('Username')} placeholder="Optional" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Password</label>
              <Input {...register('Password')} type="password" placeholder="Optional" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Last Login</label>
              <Input {...register('LastLogin')} type="datetime-local" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Last Location</label>
              <Input {...register('LastLocation')} />
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
                id="IsAdmin"
                checked={watch('IsAdmin') == 1}
                onCheckedChange={(val) => setValue('IsAdmin', val ? 1 : 0)}
              />
              <label htmlFor="IsAdmin" className="text-sm text-gray-700">Admin</label>
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

export default UpdateUserForm;
