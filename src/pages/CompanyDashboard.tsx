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
import { EditVendorDialog } from "@/components/EditVendorDialog";
import { ArrowLeft, Plus, Search, CreditCard, Trash2, Calendar as CalendarIcon, Clock, TrendingUp, TrendingDown, DollarSign, Users, Truck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { DateRange } from "react-day-picker";
import { VendorList } from "@/components/VendorList";
import { Calculator } from "@/components/Calculator";
import { companyAPI, vendorAPI, loadTypeAPI, paymentAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

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

interface Payment {
  _id: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  vendorName: string;
  vendorId: string;
  companyName: string;
  companyId: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
  date: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  vehicleNumbers: string[];
  loadTypeId?: string;
  loadTypeName?: string;
}

interface PaymentStats {
  totalAmount: number;
  totalPayments: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
}

export default function CompanyDashboard() {
  const { companyId } = useParams<{ companyId: string }>();
  const { logout } = useAuth();
  
  // State
  const [company, setCompany] = useState<Company | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loadTypes, setLoadTypes] = useState<LoadType[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [newLoadType, setNewLoadType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addVendorDialogOpen, setAddVendorDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [openPopup, setOpenPopup] = useState<null | 'expenses' | 'average' | 'vendors' | 'loadTypes' | 'calculator'>(null);

  // Load data from APIs
  useEffect(() => {
    loadData();
  }, [companyId]);

  // Load payment data when date range changes
  useEffect(() => {
    if (companyId) {
      loadPaymentData();
    }
  }, [companyId, dateRange]);

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

  const loadPaymentData = async () => {
    if (!companyId) return;
    
    try {
      const dateFrom = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : undefined;
      const dateTo = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : undefined;

      // Load payment history for this company
      const paymentsResponse = await paymentAPI.getPaymentHistory({
        companyId, // Use companyId for filtering
        dateFrom,
        dateTo,
        limit: 1000 // Get more payments for better analytics
      });
      
      setPayments(paymentsResponse.data.payments || []);

      // Load payment stats
      const statsResponse = await paymentAPI.getPaymentStats({
        companyId,
        dateFrom,
        dateTo
      });
      
      setPaymentStats(statsResponse.data.stats);
    } catch (error: any) {
      console.error("Error loading payment data:", error);
      // Don't show error toast for payment data as it might be empty initially
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
    
    setSelectedVendor(vendor);
    setPaymentDialogOpen(true);
  };

  const handleEditVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setEditDialogOpen(true);
  };

  const logPayment = (paymentData: { vendorId: string; amount: number; loadTypeId: string; vehicleNumber?: string; }) => {
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

  // Generate trend data for line/area charts
  const generateTrendData = () => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const trendData: { date: string; amount: number; count: number }[] = [];
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

    // Group payments by date
    const paymentsByDate = payments.reduce((acc, payment) => {
      const date = new Date(payment.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { amount: 0, count: 0 };
      }
      acc[date].amount += payment.amount;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    // Generate data points for each day in the range
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(from);
      currentDate.setDate(from.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      trendData.push({
        date: dateStr,
        amount: paymentsByDate[dateStr]?.amount || 0,
        count: paymentsByDate[dateStr]?.count || 0,
      });
    }

    return trendData;
  };

  const trendData = generateTrendData();

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
                  <ExpenseChart data={chartData} trendData={trendData} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Analytics Cards */}
            {paymentStats && (
              <div className="space-y-4">
                {/* Total Expenses Card */}
                <Dialog open={openPopup === 'expenses'} onOpenChange={open => setOpenPopup(open ? 'expenses' : null)}>
                  <div onClick={() => setOpenPopup('expenses')} className="cursor-pointer">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ₹{paymentStats.totalAmount.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {paymentStats.totalPayments} payments
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Total Expenses</DialogTitle>
                      <DialogDescription>
                        This is the total amount paid by the company in the selected date range.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="text-3xl font-bold mb-2">₹{paymentStats.totalAmount.toLocaleString()}</div>
                    <div className="mb-2">Payments: {paymentStats.totalPayments}</div>
                    {/* Optionally add a mini-chart or breakdown here */}
                  </DialogContent>
                </Dialog>

                {/* Average Payment Card */}
                {/* <Dialog open={openPopup === 'average'} onOpenChange={open => setOpenPopup(open ? 'average' : null)}>
                  <div onClick={() => setOpenPopup('average')} className="cursor-pointer">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ₹{paymentStats.avgAmount.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          per transaction
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Average Payment</DialogTitle>
                      <DialogDescription>
                        This is the average amount per payment in the selected date range.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="text-3xl font-bold mb-2">₹{paymentStats.avgAmount.toLocaleString()}</div>
                    <div className="mb-2">Min: ₹{paymentStats.minAmount.toLocaleString()} | Max: ₹{paymentStats.maxAmount.toLocaleString()}</div>
                  </DialogContent>
                </Dialog> */}

                {/* Active Vendors Card */}
                {/* <Dialog open={openPopup === 'vendors'} onOpenChange={open => setOpenPopup(open ? 'vendors' : null)}>
                  <div onClick={() => setOpenPopup('vendors')} className="cursor-pointer">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {vendors.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          registered vendors
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Active Vendors</DialogTitle>
                      <DialogDescription>
                        These are the vendors registered with your company.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mb-2">Total Vendors: <span className="font-bold">{vendors.length}</span></div>
                    <ul className="max-h-40 overflow-y-auto text-sm">
                      {vendors.map(v => <li key={v._id || v.id}>{v.name}</li>)}
                    </ul>
                  </DialogContent>
                </Dialog> */}

                {/* Load Types Card */}
                {/* <Dialog open={openPopup === 'loadTypes'} onOpenChange={open => setOpenPopup(open ? 'loadTypes' : null)}>
                  <div onClick={() => setOpenPopup('loadTypes')} className="cursor-pointer">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Load Types</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {loadTypes.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          active load types
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Load Types</DialogTitle>
                      <DialogDescription>
                        These are the load types available for your company.
                      </DialogDescription>
                    </DialogHeader>
                    <ul className="max-h-40 overflow-y-auto text-sm">
                      {loadTypes.map(lt => <li key={lt._id}>{lt.name}</li>)}
                    </ul>
                  </DialogContent>
                </Dialog> */}

                {/* Calculator Card */}
                <Dialog open={openPopup === 'calculator'} onOpenChange={open => setOpenPopup(open ? 'calculator' : null)}>
                  <div onClick={() => setOpenPopup('calculator')} className="cursor-pointer">
                    <Card>
                      <CardHeader>
                        <CardTitle>Calculator</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center text-muted-foreground">Click to open calculator</div>
                      </CardContent>
                    </Card>
                  </div>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Calculator</DialogTitle>
                    </DialogHeader>
                    <Calculator />
                  </DialogContent>
                </Dialog>
              </div>
            )}

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
            {/* The Calculator component is now a DialogTrigger */}
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
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            vendor={selectedVendor}
            loadTypes={loadTypes}
            company={company}
            onLogPayment={logPayment}
          />
        )}

        {/* Edit Vendor Dialog */}
        {selectedVendor && (
          <EditVendorDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            vendor={selectedVendor}
            onUpdateVendor={updateVendor}
            onDeleteVendor={deleteVendor}
          />
        )}
      </div>
    </div>
  );
}