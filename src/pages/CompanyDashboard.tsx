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
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  CreditCard, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Truck,
  BarChart3,
  Activity,
  Target,
  Zap,
  Sparkles,
  ChevronRight,
  Filter,
  RefreshCw,
  Calculator as CalculatorIcon
} from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    await loadPaymentData();
    setIsRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Dashboard data has been updated.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-primary/30"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading Dashboard</p>
            <p className="text-sm text-muted-foreground">Preparing your company data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-destructive">Company Not Found</h1>
            <p className="text-muted-foreground">The company you're looking for doesn't exist or you don't have access.</p>
          </div>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl"></div>
          <div className="relative bg-card/50 backdrop-blur-sm border rounded-3xl p-6">
        <div className="flex items-center justify-between">
              <div className="space-y-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                        <Link to="/" className="hover:text-primary transition-colors">
                          All Companies
                        </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                      <BreadcrumbPage className="font-semibold">{company.companyName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {company.companyName} Dashboard
                  </h1>
            {company.description && (
                    <p className="text-muted-foreground text-lg">{company.description}</p>
            )}
          </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="transition-all duration-200 hover:scale-105"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button asChild variant="outline" className="transition-all duration-200 hover:scale-105">
                  <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
                <Button variant="outline" onClick={logout} className="transition-all duration-200 hover:scale-105">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Cards */}
        {paymentStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Expenses Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-primary/20 hover:border-primary/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  ₹{paymentStats.totalAmount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {paymentStats.totalPayments} payments
                </p>
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </div>
              </CardContent>
            </Card>

            {/* Average Payment Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-blue-500/20 hover:border-blue-500/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
                <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">
                  ₹{paymentStats.avgAmount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  per transaction
                </p>
                <div className="mt-2 flex items-center text-xs text-blue-600">
                  <Activity className="h-3 w-3 mr-1" />
                  Min: ₹{paymentStats.minAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* Active Vendors Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-green-500/20 hover:border-green-500/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                <div className="p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <Users className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {vendors.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  registered vendors
                </p>
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  All active
                </div>
              </CardContent>
            </Card>

            {/* Load Types Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-orange-500/20 hover:border-orange-500/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Load Types</CardTitle>
                <div className="p-2 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                  <Truck className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {loadTypes.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  active load types
                </p>
                <div className="mt-2 flex items-center text-xs text-orange-600">
                  <Target className="h-3 w-3 mr-1" />
                  Ready for payments
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Chart Section */}
          <div className="lg:col-span-2">
            {payments.length === 0 ? (
              <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                  <CardTitle className="text-xl font-bold">Expense Overview</CardTitle>
                  <p className="text-sm text-muted-foreground">Track your payment trends and analytics</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-80 text-muted-foreground">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <Clock className="h-16 w-16 mx-auto opacity-50" />
                        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-primary/30"></div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium">No Payment Data Yet</p>
                        <p className="text-sm">Payment analytics will be available once the payment system is implemented</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ExpenseChart 
                data={chartData} 
                trendData={trendData} 
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onFilterChange={(filter) => {
                  // Handle filter changes here
                  console.log('Filter changed:', filter);
                }}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Enhanced Right Column */}
          <div className="space-y-6">
            {/* Enhanced Calculator Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-purple-500/20 hover:border-purple-500/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Calculator</CardTitle>
                <div className="p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Zap className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground mb-4">Calculate payments quickly</div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white transition-all duration-200 hover:scale-105">
                      <CalculatorIcon className="mr-2 h-4 w-4" />
                      Open Calculator
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Payment Calculator</DialogTitle>
                      <DialogDescription>
                        Calculate payment amounts and splits quickly.
                      </DialogDescription>
                    </DialogHeader>
                    <Calculator />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Enhanced Load Types Management */}
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500/5 to-green-500/10 border-b">
                <CardTitle className="text-lg font-bold">Manage Load Types</CardTitle>
                <p className="text-sm text-muted-foreground">Add and manage your load types for payments</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
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
                    className="flex-grow border-primary/20 focus:border-primary/40 transition-colors"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>
                
                <Separator />
                
                <div className="space-y-2">
                  {loadTypes.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Truck className="h-12 w-12 mx-auto opacity-50" />
                      <p className="text-sm text-muted-foreground">No load types yet</p>
                      <p className="text-xs text-muted-foreground">Add your first load type above</p>
                    </div>
                  ) : (
                    loadTypes.map(loadType => (
                      <div 
                        key={loadType._id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                      >
                        <Badge variant="secondary" className="font-medium">
                          {loadType.name}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLoadType(loadType._id)}
                          className="h-6 w-6 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Vendors Section */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500/5 to-blue-500/10 border-b">
            <CardTitle className="text-xl font-bold">Vendor Management</CardTitle>
            <p className="text-sm text-muted-foreground">Manage your vendors and their payment details</p>
          </CardHeader>
                      <CardContent className="p-0">
              <VendorList 
                vendors={filteredVendors} 
                loadTypes={loadTypes} 
                onEditVendor={handleEditVendor} 
                onPayVendor={handlePayVendor}
                onDeleteVendor={deleteVendor}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
              />
            </CardContent>
        </Card>

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