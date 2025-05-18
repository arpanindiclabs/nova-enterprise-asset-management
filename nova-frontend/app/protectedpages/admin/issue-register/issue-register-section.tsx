// components/IssueRegister.tsx
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";

export default function IssueRegister() {
  const handleSubmit = () => {
    Cookies.set("addModalOpen", "true")
    console.log("Asset issued");
  };

  return (
    <section className="w-full flex flex-col md:flex-row items-start md:items-center justify-between  px-4 gap-4">
      <div>
        <h1 className="text-xl font-bold mb-1">Issue Register</h1>
        <p className="text-sm text-muted-foreground">
          Manage and track the assets issued to employees or departments.
        </p>
      </div>
      <div className="text-right">
        <Button
          className="bg-black hover:bg-zinc-800 text-white"
          onClick={handleSubmit}
        >
          Issue Asset
        </Button>
      </div>
    </section>
  );
}