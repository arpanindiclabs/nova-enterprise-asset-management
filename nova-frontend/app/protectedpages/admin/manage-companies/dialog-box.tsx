import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CompanyForm from "./add-company-form";

interface CompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CompanyModal({ open, onOpenChange }: CompanyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none md:w-[85vw] lg:w-[75vw] xl:w-[70vw] 
                   h-auto max-h-[90vh] overflow-y-auto rounded-md p-6 
                   bg-white border border-gray-200 shadow-2xl transition-all duration-300 ease-in-out"
      >
        {/* Accessibility requirement: DialogTitle */}
        <DialogHeader>
          <DialogTitle className="hidden">Edit Company</DialogTitle>
        </DialogHeader>

        {/* Your actual form */}
        <CompanyForm />
      </DialogContent>
    </Dialog>
  );
}
