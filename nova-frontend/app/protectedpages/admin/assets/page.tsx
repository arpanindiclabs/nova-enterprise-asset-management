"use client";

import { useEffect, useState } from "react";
import { getColumns , AssetIssue } from "./columns";
import { DataTable } from "./data-table";
import IssueRegisterModal from "./dialog-box"; // Modal for editing issues
import Cookies from "js-cookie"; // Ensure this package is installed
import AddAssetForm from "@/components/add-asset-form";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export default function DemoPage() {
  const [data, setData] = useState<AssetIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVersion, setFilterVersion] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const fetchFilteredData = async () => {
    try {
      setLoading(true);

      const token = Cookies.get("token");
      const filterRaw = Cookies.get("filterState");

      let filters = [];
      if (!filterRaw || filterRaw === "[]") {
        filters = [];
      } else {
        try {
          filters = JSON.parse(filterRaw || "[]");
          if (!Array.isArray(filters)) {
            console.warn("Invalid filters format, resetting to empty array");
            filters = [];
          }
        } catch (e) {
          console.warn("Failed to parse filterState cookie:", e);
          filters = [];
        }
      }

      console.log("Using Filters:", filters);

      const response = await fetch(`${apiUrl}/manage-asset/get-filtered-assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${null}`,
          credentials: "include",
        },
        body: JSON.stringify({ filters }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const result = await response.json();
      console.log("Filtered Data:", result);
      setData(result);
    } catch (error) {
      console.error("Error fetching filtered data:", error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filterRaw = Cookies.get("filterState");
    if (!filterRaw || filterRaw === "[]") {
      Cookies.set("filterState", "[]", { expires: 7 });
      console.log("filterState cookie set to empty array", Cookies.get("filterState"));
    }

    fetchFilteredData();
  }, [filterVersion]);

  useEffect(() => {
    const handleCookieChange = () => {
      setFilterVersion((prev) => prev + 1);
    };

    window.addEventListener("cookie-change", handleCookieChange);
    return () => {
      window.removeEventListener("cookie-change", handleCookieChange);
    };
  }, []);

  useEffect(() => {
    const deleteFilterCookie = () => {
      Cookies.remove("filterState");
      Cookies.set("filterState", "[]", { expires: 7 });
    };

    window.addEventListener("beforeunload", deleteFilterCookie);
    return () => {
      window.removeEventListener("beforeunload", deleteFilterCookie);
    };
  }, []);

  // 👇 New effect to listen for `editModalOpen`
  useEffect(() => {
    const interval = setInterval(() => {
      const modalFlag = Cookies.get("editModalOpen");
      const addmodalFlag = Cookies.get("addModalOpen");
      if (modalFlag === "true") {
        setModalOpen(true);
        Cookies.remove("editModalOpen"); // Reset to avoid repeat
        Cookies.set("modalType", "edit")
      }
      if (addmodalFlag === "true") {
        setAddModalOpen(true);
        Cookies.remove("addModalOpen"); // Reset to avoid repeat
        Cookies.set("modalType", "add")
      }
    }, 500); // Polling every 500ms

    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
  
    <div className="container px-16 w-full mx-auto py-10 md:py-0.5 md:my-0 flex flex-col ">
      <AddAssetForm />
      <DataTable columns={getColumns} data={data} />
      <IssueRegisterModal  open={isModalOpen} onOpenChange={setModalOpen} />
      <IssueRegisterModal  open={isAddModalOpen} onOpenChange={setAddModalOpen} />
    </div>
  );
}
