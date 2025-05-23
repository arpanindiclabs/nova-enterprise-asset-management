import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import  HardwareActionForm from "./hardware-action-form";
// import { NewIssueForm } from "./new-issue-form";
import Cookies from "js-cookie"; // Ensure this package is installed

// Helper to get cookie value
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function IssueRegisterModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {

  console.log(Cookies.get("modalType"))
  const modalType = Cookies.get("modalType") || "edit"; // Default to 'edit' if not set
  // console.log(Cookies.get("addModalOpen"))


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className="max-w-none md:w-[85vw] lg:w-[75vw] xl:w-[70vw] 
                 h-auto max-h-[90vh] overflow-y-auto rounded-md p-6 
                 bg-white border border-gray-200 shadow-2xl transition-all duration-300 ease-in-out"
    >
      <HardwareActionForm />
    </DialogContent>
  </Dialog>
  )
}

