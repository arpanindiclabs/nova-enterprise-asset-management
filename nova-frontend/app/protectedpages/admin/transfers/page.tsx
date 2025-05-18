"use client";

import { useEffect, useState } from "react";
import { getTransferColumns, Issue } from "./columns";
import { DataTable } from "./data-table";
import Cookies from "js-cookie"; // Ensure this package is installed
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function DemoPage() {
  const [data, setData] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVersion, setFilterVersion] = useState(0);
  // const [isModalOpen, setModalOpen] = useState(false);
  // const [isAddModalOpen, setAddModalOpen] = useState(false);

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

      const response = await fetch(`${apiUrl}/transfer-asset-function/get-filtered-transfers-admin`, {
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
  
    <div className="container px-16 w-full mx-auto py-10 flex flex-col ">
      <section className="w-full flex flex-col md:flex-row items-start md:items-center justify-between  px-4 gap-4">
      <div>
        <h1 className="text-xl font-bold mb-1">Transfer Register</h1>
        <p className="text-sm text-muted-foreground">
          Manage and track the assets transferred from employees or departments.
        </p>
      </div>
      
    </section>
      <DataTable  data={data} />
      
    </div>
  );
}
