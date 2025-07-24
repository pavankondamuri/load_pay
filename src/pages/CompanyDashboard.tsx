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
import { ArrowLeft, Plus, Search, CreditCard, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DateRange } from "react-day-picker";
import { VendorList } from "@/components/VendorList";
import { Vendor } from "@/lib/vender";
import { Calculator } from "@/components/Calculator";

interface Company {
  id: string;
  name: string;
  description: string;
}



interface LoadType {
  id: string;
  name: string;
  companyId: string;
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
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadTypes, setLoadTypes] = useState<LoadType[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newLoadType, setNewLoadType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  // Load data from localStorage
  useEffect(() => {
    const companies = JSON.parse(localStorage.getItem("companies") || "[]");
    const foundCompany = companies.find((c: Company) => c.id === companyId);
    setCompany(foundCompany || null);

    const allVendors = JSON.parse(localStorage.getItem("vendors") || "[]");
    setVendors(allVendors);
    setFilteredVendors(allVendors);
    
    const allLoadTypes = JSON.parse(localStorage.getItem("loadTypes") || "[]");
    setLoadTypes(allLoadTypes.filter((lt: LoadType) => lt.companyId === companyId));
    
    const allPayments = JSON.parse(localStorage.getItem("payments") || "[]");
    setPayments(allPayments.filter((p: Payment) => p.companyId === companyId));
  }, [companyId]);

  const addLoadType = () => {
    if (!newLoadType.trim()) {
      toast({
        title: "Error",
        description: "Load type name is required",
        variant: "destructive",
      });
      return;
    }

    const loadType: LoadType = {
      id: Date.now().toString(),
      name: newLoadType.trim(),
      companyId: companyId!,
    };

    const updatedLoadTypes = [...loadTypes, loadType];
    setLoadTypes(updatedLoadTypes);
    
    const allLoadTypes = JSON.parse(localStorage.getItem("loadTypes") || "[]");
    const filteredLoadTypes = allLoadTypes.filter((lt: LoadType) => lt.companyId !== companyId);
    localStorage.setItem("loadTypes", JSON.stringify([...filteredLoadTypes, ...updatedLoadTypes]));
    
    setNewLoadType("");
    toast({
      title: "Success",
      description: "Load type added successfully",
    });
  };

  const deleteLoadType = (id: string) => {
    const updatedLoadTypes = loadTypes.filter(lt => lt.id !== id);
    setLoadTypes(updatedLoadTypes);
    
    const allLoadTypes = JSON.parse(localStorage.getItem("loadTypes") || "[]");
    const filteredLoadTypes = allLoadTypes.filter((lt: LoadType) => lt.id !== id);
    localStorage.setItem("loadTypes", JSON.stringify(filteredLoadTypes));
    
    toast({
      title: "Success",
      description: "Load type deleted successfully",
    });
  };

  const handlePayVendor = (vendor: Vendor) => {
    if (loadTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one load type before logging payments",
        variant: "destructive",
      });
      return;
    }
    setSelectedVendor(vendor);
    setPaymentDialogOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsEditDialogOpen(true);
  };

  const logPayment = (paymentData: Omit<PaymentData, "id" | "date" | "companyId">) => {
    const vendor = vendors.find(v => v.id === paymentData.vendorId);
    if (!vendor) {
      toast({
        title: "Error",
        description: "Vendor not found",
        variant: "destructive",
      });
      return;
    }

    const payment: Payment = {
      id: Date.now().toString(),
      ...paymentData,
      date: new Date().toISOString(),
      companyId: companyId!,
      vendorName: vendor.name,
      status: "Paid",
    };

    const allPayments = JSON.parse(localStorage.getItem("payments") || "[]");
    localStorage.setItem("payments", JSON.stringify([...allPayments, payment]));

    setPayments(prevPayments => [...prevPayments, payment]);
  };

  const updateVendor = (updatedVendor: Vendor) => {
    const updatedVendors = vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v);
    setVendors(updatedVendors);
    localStorage.setItem("vendors", JSON.stringify(updatedVendors));
  };

  const deleteVendor = (vendorId: string) => {
    // Filter out the vendor
    const updatedVendors = vendors.filter(v => v.id !== vendorId);
    setVendors(updatedVendors);
    localStorage.setItem("vendors", JSON.stringify(updatedVendors));

    // Filter out payments associated with the vendor
    const updatedPayments = payments.filter(p => p.vendorId !== vendorId);
    setPayments(updatedPayments);
    const allPayments = JSON.parse(localStorage.getItem("payments") || "[]");
    const filteredPayments = allPayments.filter((p: Payment) => p.vendorId !== vendorId);
    localStorage.setItem("payments", JSON.stringify(filteredPayments));
  };

  const handleSearch = () => {
    const searchResult = vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.accountHolderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.ifscCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.vehicleNumbers && vendor.vehicleNumbers.some(vn => vn.toLowerCase().includes(searchTerm.toLowerCase())))
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
          return p.loadTypeId === loadType.id && paymentDate >= from && paymentDate <= to;
        } else if (from) {
          return p.loadTypeId === loadType.id && paymentDate >= from;
        } else if (to) {
          return p.loadTypeId === loadType.id && paymentDate <= to;
        }
        return p.loadTypeId === loadType.id;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    return {
      loadType: loadType.name,
      amount: total,
    };
  }).filter(item => item.amount > 0);


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
                  <BreadcrumbPage>{company.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-3xl font-bold">{company.name} Dashboard</h1>
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
                <ExpenseChart data={chartData} />
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
                <div className="flex space-x-2">
                  <Input
                    value={newLoadType}
                    onChange={(e) => setNewLoadType(e.target.value)}
                    placeholder="Enter load type name"
                    onKeyPress={(e) => e.key === "Enter" && addLoadType()}
                  />
                  <Button onClick={addLoadType} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {loadTypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No load types yet. Add your first load type above.
                    </p>
                  ) : (
                    loadTypes.map(loadType => (
                      <div key={loadType.id} className="flex items-center justify-between">
                        <Badge variant="secondary">{loadType.name}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLoadType(loadType.id)}
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
          vendors={vendors} 
          loadTypes={loadTypes} 
          onEditVendor={handleEditVendor} 
          onPayVendor={handlePayVendor}
          onDeleteVendor={deleteVendor}
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