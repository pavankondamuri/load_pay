import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ExpenseChart } from "@/components/ExpenseChart";
import { PaymentDialog } from "@/components/PaymentDialog";
import { ArrowLeft, Plus, Search, CreditCard, Trash2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DateRange } from "react-day-picker";
import { VendorList } from "@/components/VendorList";
import { Calculator } from "@/components/Calculator";
import { companyAPI, vendorAPI, loadTypeAPI } from "@/lib/api";

interface Company {
 _id?: string;
 companyName: string;
 ownerName: string;
 email?: string;
 phoneNumber?: number;
 description?: string;
 paymentHistory: string[];
 createdAt?: string;
 updatedAt?: string;
}

interface LoadType {
  _id: string;
  name: string;
  companyId: string;
  description?: string;
  isActive: boolean;
}

interface Payment extends PaymentData {
  vendorName: string;
  status: "Paid" | "Pending" | "Failed";
}

interface PaymentData {
  id: string;
  vendorId: string;
  amount: number;
  loadTypeId: string;
  date: string;
  companyId: string;
  vehicleNumber?: string;
}

export default function CompanyDashboard() {
  const { companyId } = useParams<{ companyId: string }>();
  const { logout } = useAuth();
  
  // State
  const [company, setCompany] = useState<Company | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loadTypes, setLoadTypes] = useState<LoadType[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newLoadType, setNewLoadType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [addVendorDialogOpen, setAddVendorDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // Load data from APIs
  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      // Load company details
      const companyResponse = await companyAPI.getById(companyId);
      setCompany(companyResponse.data.company);

      // Load vendors
      const vendorsResponse = await vendorAPI.getAll();
      const vendorsData = vendorsResponse.data.vendors || [];
      setVendors(vendorsData);
      setFilteredVendors(vendorsData);

      // Load load types for this company
      const loadTypesResponse = await loadTypeAPI.getByCompany(companyId);
      const loadTypesData = loadTypesResponse.data.loadTypes || [];
      setLoadTypes(loadTypesData);

      // TODO: Load payments from API when payment system is implemented
      // For now, set empty array
      setPayments([]);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load company data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm, vendors]);

  const addLoadType = async () => {
    if (!newLoadType.trim() || !companyId) {
      toast({
        title: "Error",
        description: "Load type name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await loadTypeAPI.create({
        name: newLoadType.trim(),
        companyId: companyId,
      });

      if (response.status === 201) {
        const newLoadTypeData = response.data.loadType;
        setLoadTypes(prev => [...prev, newLoadTypeData]);
        setNewLoadType("");
        toast({
          title: "Success",
          description: "Load type added successfully",
        });
      }
    } catch (error: any) {
      console.error("Error adding load type:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add load type",
        variant: "destructive",
      });
    }
  };

  const deleteLoadType = async (loadTypeId: string) => {
    try {
      const response = await loadTypeAPI.delete(loadTypeId);

      if (response.status === 200) {
        setLoadTypes(prev => prev.filter(lt => lt._id !== loadTypeId));
        toast({
          title: "Success",
          description: "Load type deleted successfully",
        });
      }
    } catch (error: any) {
      console.error("Error deleting load type:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete load type",
        variant: "destructive",
      });
    }
  };

  const handlePayVendor = (vendor: any) => {
    if (loadTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one load type before logging payments",
        variant: "destructive",
      });
      return;
    }
    
    // TODO: Implement payment functionality when payment API is ready
    toast({
      title: "Payment System Coming Soon",
      description: "Payment functionality will be available once the payment gateway is integrated.",
    });
  };

  const handleEditVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsEditDialogOpen(true);
  };

  const logPayment = (paymentData: Omit<PaymentData, "id" | "date" | "companyId">) => {
    // TODO: Implement payment logging when payment API is ready
    toast({
      title: "Payment System Coming Soon",
      description: "Payment logging will be available once the payment system is implemented.",
    });
  };

  const updateVendor = async (updatedVendor: any) => {
    try {
      const response = await vendorAPI.update(updatedVendor._id, {
        name: updatedVendor.name,
        accountHolderName: updatedVendor.accountHolderName,
        accountNumber: updatedVendor.accountNumber,
        ifscCode: updatedVendor.ifscCode,
        phoneNumber: updatedVendor.phoneNumber,
        vechicleNumber: updatedVendor.vechicleNumber || updatedVendor.vehicleNumbers || [],
      });

      if (response.status === 200) {
        const updatedVendors = vendors.map(v => v._id === updatedVendor._id ? response.data.vendor : v);
        setVendors(updatedVendors);
        toast({
          title: "Vendor Updated",
          description: `${updatedVendor.name} has been updated successfully.`,
        });
      }
    } catch (error: any) {
      console.error("Error updating vendor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update vendor",
        variant: "destructive",
      });
    }
  };

  const deleteVendor = async (vendorId: string) => {
    try {
      const response = await vendorAPI.delete(vendorId);

      if (response.status === 200) {
        // Filter out the vendor
        const updatedVendors = vendors.filter(v => v._id !== vendorId);
        setVendors(updatedVendors);
        
        toast({
          title: "Vendor Deleted",
          description: "Vendor has been deleted successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error deleting vendor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete vendor",
        variant: "destructive",
      });
    }
  };

  const handleSearch = () => {
    const searchResult = vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.accountHolderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.ifscCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.phoneNumber.toString().includes(searchTerm.toLowerCase()) ||
      (vendor.vechicleNumber && vendor.vechicleNumber.some((vn: string) => vn.toLowerCase().includes(searchTerm.toLowerCase())))
    );
    setFilteredVendors(searchResult);
  };

  // Prepare chart data based on selected date range
  const chartData = loadTypes.map(loadType => {
    const total = payments
      .filter(p => {
        const paymentDate = new Date(p.date);
        const from = dateRange?.from ? new Date(dateRange.from.setHours(0, 0, 0, 0)) : null;
        const to = dateRange?.to ? new Date(dateRange.to.setHours(23, 59, 59, 999)) : null;
        
        if (from && to) {
          return p.loadTypeId === loadType._id && paymentDate >= from && paymentDate <= to;
        } else if (from) {
          return p.loadTypeId === loadType._id && paymentDate >= from;
        } else if (to) {
          return p.loadTypeId === loadType._id && paymentDate <= to;
        }
        return p.loadTypeId === loadType._id;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    return {
      loadType: loadType.name,
      amount: total,
    };
  }).filter(item => item.amount > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company dashboard...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Company Not Found</h1>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">All Companies</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{company.companyName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-3xl font-bold">{company.companyName} Dashboard</h1>
            {company.description && (
              <p className="text-muted-foreground">{company.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Expense Overview</CardTitle>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-[280px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {new Date(dateRange.from).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })} -{" "}
                              {new Date(dateRange.to).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                            </>
                          ) : (
                            new Date(dateRange.from).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 flex" align="end">
                      <div className="flex flex-col space-y-1 border-r pr-3 pl-2 py-2">
                        <Button onClick={() => {
                          const to = new Date();
                          const from = new Date();
                          from.setDate(from.getDate() - 7);
                          setDateRange({ from, to });
                        }} variant="ghost" className="justify-start font-normal">Last 7 days</Button>
                        <Button onClick={() => {
                          const to = new Date();
                          const from = new Date();
                          from.setDate(from.getDate() - 30);
                          setDateRange({ from, to });
                        }} variant="ghost" className="justify-start font-normal">Last 30 days</Button>
                        <Button onClick={() => {
                          const to = new Date();
                          const from = new Date(to.getFullYear(), to.getMonth(), 1);
                          setDateRange({ from, to });
                        }} variant="ghost" className="justify-start font-normal">This month</Button>
                        <Button onClick={() => {
                          const today = new Date();
                          const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                          const to = new Date(today.getFullYear(), today.getMonth(), 0);
                          setDateRange({ from, to });
                        }} variant="ghost" className="justify-start font-normal">Last month</Button>
                        <Button onClick={() => {
                          const to = new Date();
                          const from = new Date();
                          from.setFullYear(from.getFullYear() - 1);
                          setDateRange({ from, to });
                        }} variant="ghost" className="justify-start font-normal">Last year</Button>
                      </div>
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        captionLayout="dropdown-buttons"
                        fromYear={new Date().getFullYear() - 10}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                {payments.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Payment data will be available</p>
                      <p className="text-sm">once the payment system is implemented</p>
                    </div>
                  </div>
                ) : (
                  <ExpenseChart data={chartData} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Load Types Management */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Load Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addLoadType();
                  }}
                  className="flex space-x-2"
                >
                  <Input
                    value={newLoadType}
                    onChange={(e) => setNewLoadType(e.target.value)}
                    placeholder="Enter load type name"
                    className="flex-grow"
                  />
                  <Button type="submit" size="icon" className="flex-shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>
                
                <div className="space-y-2">
                  {loadTypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No load types yet. Add your first load type above.
                    </p>
                  ) : (
                    loadTypes.map(loadType => (
                      <div key={loadType._id} className="flex items-center justify-between">
                        <Badge variant="secondary">{loadType.name}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLoadType(loadType._id)}
                          className="h-6 w-6 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Calculator */}
            <Calculator />
          </div>
        </div>

        {/* Vendors Table */}
        <VendorList 
          vendors={filteredVendors} 
          loadTypes={loadTypes} 
          onEditVendor={handleEditVendor} 
          onPayVendor={handlePayVendor}
          onDeleteVendor={deleteVendor}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
        />

        {/* Payment Dialog */}
        {selectedVendor && (
          <PaymentDialog
            open={paymentDialogOpen || isEditDialogOpen}
            onOpenChange={isEditDialogOpen ? setIsEditDialogOpen : setPaymentDialogOpen}
            vendor={selectedVendor}
            loadTypes={loadTypes}
            onLogPayment={logPayment}
            onUpdateVendor={updateVendor}
            onDeleteVendor={deleteVendor}
            startInEditMode={isEditDialogOpen}
            showPaymentFields={true}
          />
        )}
      </div>
    </div>
  );
}