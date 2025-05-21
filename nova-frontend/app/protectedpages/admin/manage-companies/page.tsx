"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import CompanyModal from "./dialog-box";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Building,
  Users,
  Monitor,
  ShoppingCart,
  Plus,
} from "lucide-react";

interface CompanyOverview {
  CompRecID: number;
  CompCode: string;
  CompName: string;
  employeeCount: number;
  activeDeviceCount: number;
  purchasedDeviceCount: number;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function CompanyOverviewCards() {
  const [companies, setCompanies] = useState<CompanyOverview[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${apiUrl}/manage-company/company-overview`);
        const data = await res.json();
        setCompanies(data);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const modalFlag = Cookies.get("editModalOpen");
    if (modalFlag === "true") {
      setModalOpen(true);
      Cookies.remove("editModalOpen");
      Cookies.set("modalType", "edit");
    }
  }, []);

  const handleEditClick = (company: CompanyOverview) => {
    Cookies.set("selected", JSON.stringify(company));
    Cookies.set("editModalOpen", "true");
    Cookies.set("modalType", "edit");
    setModalOpen(true);
  };

  const handleAddClick = () => {
    Cookies.set("modalType", "add");
    setModalOpen(true);
  };

  return (
    <div className="p-6"> 
      <h2 className="text-3xl font-semibold text-black mb-6">Company Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
        

        {/* Existing Companies */}
        {companies.map((company) => (
          <Card
            key={company.CompRecID}
            className="@container/card bg-gray-50 hover:shadow-md cursor-pointer relative"
          >
            <CardHeader>
              <CardDescription className="text-black">{company.CompCode.trim()}</CardDescription>
              <CardTitle className="text-2xl font-semibold text-black truncate @[250px]/card:text-3xl">
                {company.CompName}
              </CardTitle>
              <CardAction>
                <Badge variant="outline" className="text-black border-black">
                  <Building className="w-4 h-4 mr-1" /> ID: {company.CompRecID}
                </Badge>
              </CardAction>
            </CardHeader>

            <CardFooter className="flex-col items-start gap-2 text-sm text-black">
              <div className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4" /> {company.employeeCount} Employees
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Monitor className="w-4 h-4" /> {company.activeDeviceCount} Active Devices
              </div>
              <div className="flex items-center gap-2 font-medium">
                <ShoppingCart className="w-4 h-4" /> {company.purchasedDeviceCount} Purchased Devices
              </div>
            </CardFooter>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-2 right-2 text-black hover:bg-black/10"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditClick(company)} className="cursor-pointer">
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        ))}
        {/* Add Company Card */}
        <Card
          className="@container/card flex flex-col justify-center items-center text-center border-dashed border-2 border-gray-300 hover:shadow-md cursor-pointer bg-white"
          onClick={handleAddClick}
        >
          <CardHeader>
            <div className="flex items-center">
                <Plus className="w-25 h-25 text-gray-600" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Modal for Add/Edit */}
      <CompanyModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
