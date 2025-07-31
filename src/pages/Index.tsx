import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyCard } from "@/components/CompanyCard";
import { AddCompanyDialog } from "@/components/AddCompanyDialog";
import { EditCompanyDialog } from "@/components/EditCompanyDialog";
import { AddVendorDialog } from "@/components/AddVendorDialog";
import { EditVendorDialog } from "@/components/EditVendorDialog";
import { VendorList } from "@/components/VendorList";
import { Building2, Users, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Vendor } from "@/lib/vender";
import { PaymentDialog } from "@/components/PaymentDialog";
import axios from "axios";

interface Company {
  id?: string;
  companyName: string;
  description: string;
  ownerName?: string;
  email?: string;
  phoneNumber?: string;
  _id?: string;
}



const Index = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [editCompanyOpen, setEditCompanyOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editVendorOpen, setEditVendorOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);


  const { logout } = useAuth();

  // Load data from localStorage on component mount
  useEffect(() => {
    const allVendors = JSON.parse(localStorage.getItem("vendors") || "[]");

    const allCompanies = async()=>{ 
     const  res = await axios.get("http://localhost:3000/api/company/get",{
      headers:{
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
     });
     return res.data.compines;
    };
    allCompanies().then(res=>{
      setCompanies(res);
      setFilteredCompanies(res);
    });
    console.log(companies,"companies");
    setVendors(allVendors);
    setFilteredVendors(allVendors);
  }, []);

  useEffect(() => {
    handleVendorSearch();
  }, [vendorSearchTerm, vendors]);

  const addCompany = (companyData: { companyName: string; description: string, ownerName?: string, email?: string, phoneNumber?: string, }) => {
    const newCompany: Company = {
      id: Date.now().toString(),
      ...companyData,
    };
    
    const updatedCompanies = [...companies, newCompany];
    setCompanies(updatedCompanies);
    localStorage.setItem("companies", JSON.stringify(updatedCompanies));
  };

  const handleEditCompany = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      setEditCompanyOpen(true);
    }
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    const updatedCompanies = companies.map((company) =>
      company.id === updatedCompany.id ? updatedCompany : company
    );
    setCompanies(updatedCompanies);
    
    const searchResult = updatedCompanies.filter((company) =>
      company.companyName.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
    setFilteredCompanies(searchResult);
    
    localStorage.setItem("companies", JSON.stringify(updatedCompanies));
  };

  const handleDeleteCompany = (companyId: string) => {
    const updatedCompanies = companies.filter(
      (company) => company.id !== companyId
    );
    setCompanies(updatedCompanies);

    const searchResult = updatedCompanies.filter((company) =>
      company.companyName.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
    setFilteredCompanies(searchResult);

    localStorage.setItem("companies", JSON.stringify(updatedCompanies));
    toast({
      title: "Company Deleted",
      description: "The company has been successfully deleted.",
    });
  };

  const addVendor = (vendorData: { name: string; accountHolderName: string; accountNumber: string; ifscCode: string; phoneNumber: string; vehicleNumbers: string[]; }) => {
    const newVendor = {
      id: Date.now().toString(),
      ...vendorData,
    };
    
    const updatedVendors = [...vendors, newVendor];
    setVendors(updatedVendors);
    localStorage.setItem("vendors", JSON.stringify(updatedVendors));
  };

  const handleEditVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsEditMode(true);
    setIsEditDialogOpen(true);
  };
  // const handleEditVendor = (vendor: Vendor) => {
  //   setSelectedVendor(vendor);
  //   setEditVendorOpen(true);
  // };

  const handleUpdateVendor = (updatedVendor: any) => {
    const updatedVendors = vendors.map((vendor) =>
      vendor.id === updatedVendor.id ? updatedVendor : vendor
    );
    setVendors(updatedVendors);
    const searchResult = updatedVendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        vendor.accountHolderName.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        vendor.ifscCode.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        vendor.phoneNumber.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        (vendor.vehicleNumbers && vendor.vehicleNumbers.some(vn => vn.toLowerCase().includes(vendorSearchTerm.toLowerCase())))
    );
    setFilteredVendors(searchResult);
    localStorage.setItem("vendors", JSON.stringify(updatedVendors));
  };

  const handleDeleteVendor = (vendorId: string) => {
    const updatedVendors = vendors.filter((vendor) => vendor.id !== vendorId);
    setVendors(updatedVendors);
    const searchResult = updatedVendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        vendor.accountHolderName.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        vendor.ifscCode.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        vendor.phoneNumber.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        (vendor.vehicleNumbers && vendor.vehicleNumbers.some(vn => vn.toLowerCase().includes(vendorSearchTerm.toLowerCase())))
    );
    setFilteredVendors(searchResult);
    localStorage.setItem("vendors", JSON.stringify(updatedVendors));
    toast({
      title: "Vendor Deleted",
      description: "The vendor has been successfully deleted.",
    });
  };

  const viewCompany = (companyId: string) => {
    navigate(`/company/${companyId}`);
  };

  const handleVendorSearch = () => {
    const searchResult = vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        vendor.accountHolderName.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        vendor.ifscCode.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        vendor.phoneNumber.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        (vendor.vehicleNumbers && vendor.vehicleNumbers.some(vn => vn.toLowerCase().includes(vendorSearchTerm.toLowerCase())))
    );
    setFilteredVendors(searchResult);
  };

  const handleCompanySearch = () => {
    const searchResult = companies.filter((company) =>
      company.companyName.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
    setFilteredCompanies(searchResult);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Companies</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/payment-history')}>
              Payment History
            </Button>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <AddCompanyDialog onAddCompany={addCompany} />
          <AddVendorDialog />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{companies.length}</div>
            <div className="text-sm text-muted-foreground">Companies</div>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{vendors.length}</div>
            <div className="text-sm text-muted-foreground">Vendors</div>
          </div>
        </div>

        {/* Companies Grid */}
        {companies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Companies Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by adding your first company. You'll be able to manage vendors, 
              track expenses, and see spending insights for each company.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex justify-center items-center mb-6">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={companySearchTerm}
                  onChange={(e) => setCompanySearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button onClick={handleCompanySearch} className="ml-2">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-2xl font-semibold mb-6 text-center">Your Companies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredCompanies.map(company => (
                <CompanyCard
                  key={company.id}
                  id={company.id}
                  companyName={company.companyName}
                  description={company.description}
                  ownerName={company.ownerName}
                  email={company.email}
                  phoneNumber={company.phoneNumber}
                  onView={viewCompany}
                  onEdit={handleEditCompany}
                  onDelete={handleDeleteCompany}
                />
              ))}
            </div>
          </div>
        )}
         <div className="mt-12">
          {/* Vendors Table */}
          <VendorList 
          vendors={filteredVendors} 
          onEditVendor={handleEditVendor} 
          onDeleteVendor={handleDeleteVendor}
          searchTerm={vendorSearchTerm}
          onSearchTermChange={setVendorSearchTerm}
        />
        </div>
        {selectedVendor && (
          <PaymentDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            vendor={selectedVendor}
            loadTypes={[]}
            onUpdateVendor={handleUpdateVendor}
            onDeleteVendor={handleDeleteVendor}
            startInEditMode={isEditMode}
            showPaymentFields={!isEditMode}
          />
        )}
        {selectedCompany && (
          <EditCompanyDialog
            company={selectedCompany}
            open={editCompanyOpen}
            onOpenChange={setEditCompanyOpen}
            onEditCompany={handleUpdateCompany}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
