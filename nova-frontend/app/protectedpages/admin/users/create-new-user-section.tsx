// components/CreateNewUser.tsx
import Cookies from "js-cookie";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CreateNewUser() {
  const handleSubmit = () => {
    Cookies.set("addModalOpen", "true")
    console.log("Asset issued");
  };

  return (
    <section className="w-full flex flex-col md:flex-row items-start md:items-center justify-between  px-4 gap-4">
      <div>
        <h1 className="text-xl font-bold mb-1">Manage Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage and track the employees or Users
        </p>
      </div>
      <div className="text-right">
        <Button
          className="bg-black hover:bg-zinc-800 text-white"
        >
          <Link href="../../register" target="_blank">Create New User</Link>
        </Button>
      </div>
    </section>
  );
}