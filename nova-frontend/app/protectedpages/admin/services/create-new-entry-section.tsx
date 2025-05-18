// components/IssueRegister.tsx
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";

export default function CreateNewEntry() {
  const handleSubmit = () => {
    Cookies.set("addModalOpen", "true")
    console.log("Asset issued");
  };

  return (
    <section className="w-full flex flex-col md:flex-row items-start md:items-center justify-between  px-4 gap-4">
      <div>
        <h1 className="text-xl font-bold mb-1">Services</h1>
        <p className="text-sm text-muted-foreground">
        This module enables administrators to efficiently manage and track hardware assets issued to employees or departments. It supports the following key operations:
        </p>
      </div>
      <div className="text-right">
        <Button
          className="bg-black hover:bg-zinc-800 text-white"
          onClick={handleSubmit}
        >
          Create New Entry
        </Button>
      </div>
    </section>
  );
}