"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
export default function AddUserHeader({ onRefresh }: { onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    EmpNo: "",
    EmpName: "",
    EmpCompID: "",
    EmpDeptID: "",
    EmpContNo: "",
    IsActive: true,
    Username: "",
    Password: "",
    IsAdmin: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast("Authorization token not found.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/manage-user/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast("User added successfully!");
        setFormData({
          EmpNo: "",
          EmpName: "",
          EmpCompID: "",
          EmpDeptID: "",
          EmpContNo: "",
          IsActive: true,
          Username: "",
          Password: "",
          IsAdmin: false,
        });
        setOpen(false);
        onRefresh(); // refresh user list
      } else {
        const error = await response.json();
        toast(`Error: ${error.message || "Failed to add user."}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      toast("Network error. Please try again.");
    }
  };

  return (
    <div className=" flex justify-between space-y-6 w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex-col justify-between items-center">
        <h2 className="text-xl font-semibold">Add New User</h2>
        <p className="text-sm text-muted-foreground">
          Enter details to add a new user to the system.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex-row  space-x-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-neutral-900">
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Employee Number", id: "EmpNo", placeholder: "EMP00091" },
                { label: "Name", id: "EmpName", placeholder: "John Doe" },
                { label: "Company ID", id: "EmpCompID", placeholder: "COMP001" },
                { label: "Department ID", id: "EmpDeptID", placeholder: "DEPT001" },
                { label: "Contact Number", id: "EmpContNo", placeholder: "9876543210" },
                { label: "Username", id: "Username", placeholder: "johndoe" },
                { label: "Password", id: "Password", placeholder: "Password@123", type: "password" },
              ].map(({ label, id, placeholder, type = "text" }) => (
                <div key={id}>
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    name={id}
                    value={(formData as any)[id]}
                    placeholder={placeholder}
                    type={type}
                    onChange={handleChange}
                  />
                </div>
              ))}

              <div className="flex space-x-4 items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="IsActive"
                    checked={formData.IsActive}
                    onChange={handleChange}
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="IsAdmin"
                    checked={formData.IsAdmin}
                    onChange={handleChange}
                  />
                  <span>Admin</span>
                </label>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-neutral-900"
                >
                  Submit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={onRefresh}>
          Refresh Users
        </Button>
      </div>
    </div>
  );
}
