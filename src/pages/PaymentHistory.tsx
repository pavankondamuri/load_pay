import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { ArrowLeft, Search, Filter, Calendar as CalendarIcon, IndianRupee, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { paymentAPI } from "@/lib/api";

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

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PaymentHistory() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState({
    vendorName: "",
    companyName: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
    vehicleNumber: "",
    loadTypeId: "",
    page: 1,
    limit: 20
  });
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [globalSearch, setGlobalSearch] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    loadPaymentHistory();
    loadPaymentStats();
  }, [filters]);

  const loadPaymentHistory = async () => {
    setIsLoading(true);
    try {
      const response = await paymentAPI.getPaymentHistory({
        ...filters,
        page: filters.page,
        limit: filters.limit,
        amountMin: filters.amountMin ? Number(filters.amountMin) : undefined,
        amountMax: filters.amountMax ? Number(filters.amountMax) : undefined,
      });
      
      setPayments(response.data.payments);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error("Error loading payment history:", error);
      toast({
        title: "Error",
        description: "Failed to load payment history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentStats = async () => {
    try {
      const response = await paymentAPI.getPaymentStats({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      });
      setStats(response.data.stats);
    } catch (error: any) {
      console.error("Error loading payment stats:", error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setFilters(prev => ({
      ...prev,
      dateFrom: range?.from ? range.from.toISOString().split('T')[0] : "",
      dateTo: range?.to ? range.to.toISOString().split('T')[0] : "",
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      vendorName: "",
      companyName: "",
      status: "",
      dateFrom: "",
      dateTo: "",
      amountMin: "",
      amountMax: "",
      vehicleNumber: "",
      loadTypeId: "",
      page: 1,
      limit: 20
    });
    setDateRange(undefined);
    setGlobalSearch("");
  };

  const handleGlobalSearch = (searchTerm: string) => {
    setGlobalSearch(searchTerm);
    setFilters(prev => ({
      ...prev,
      vendorName: searchTerm,
      companyName: searchTerm,
      vehicleNumber: searchTerm,
      page: 1
    }));
  };

  const formatToIST = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = [
      'Payment ID', 'Vendor', 'Company', 'Amount', 'Status', 'Date', 
      'Account Holder', 'Account Number', 'IFSC Code', 'Vehicles', 'Load Type'
    ];
    
    const csvData = payments.map(payment => [
      payment.razorpay_payment_id,
      payment.vendorName,
      payment.companyName,
      payment.amount,
      payment.status,
      formatToIST(payment.date),
      payment.accountHolderName || '',
      payment.accountNumber || '',
      payment.ifscCode || '',
      payment.vehicleNumbers.join(', '),
      payment.loadTypeName || ''
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.vendorName) count++;
    if (filters.companyName) count++;
    if (filters.status) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.amountMin || filters.amountMax) count++;
    if (filters.vehicleNumber) count++;
    if (filters.loadTypeId) count++;
    if (globalSearch) count++;
    return count;
  };

  const getActiveFiltersText = () => {
    const activeFilters = [];
    if (filters.vendorName) activeFilters.push(`Vendor: ${filters.vendorName}`);
    if (filters.companyName) activeFilters.push(`Company: ${filters.companyName}`);
    if (filters.status) activeFilters.push(`Status: ${filters.status}`);
    if (filters.dateFrom || filters.dateTo) activeFilters.push('Date Range');
    if (filters.amountMin || filters.amountMax) activeFilters.push('Amount Range');
    if (filters.vehicleNumber) activeFilters.push(`Vehicle: ${filters.vehicleNumber}`);
    if (filters.loadTypeId) activeFilters.push(`Load Type: ${filters.loadTypeId}`);
    if (globalSearch) activeFilters.push(`Search: ${globalSearch}`);
    return activeFilters;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment history...</p>
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
            <h1 className="text-3xl font-bold">Payment History</h1>
            <p className="text-muted-foreground">View and filter all payment transactions</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(stats.totalAmount)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPayments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(stats.avgAmount)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Max Amount</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(stats.maxAmount)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Active Filters ({getActiveFiltersCount()})</span>
                </div>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {getActiveFiltersText().map((filter, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {filter}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
              >
                {isFilterVisible ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Global Search */}
            <div className="mb-4">
              <Label htmlFor="globalSearch">Global Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="globalSearch"
                  placeholder="Search across vendors, companies, vehicles..."
                  value={globalSearch}
                  onChange={(e) => handleGlobalSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isFilterVisible && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendorName">Vendor Name</Label>
                  <Input
                    id="vendorName"
                    placeholder="Search vendor..."
                    value={filters.vendorName}
                    onChange={(e) => handleFilterChange('vendorName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Search company..."
                    value={filters.companyName}
                    onChange={(e) => handleFilterChange('companyName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                            </>
                          ) : (
                            dateRange.from.toLocaleDateString()
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={handleDateRangeChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amountMin">Min Amount</Label>
                  <Input
                    id="amountMin"
                    type="number"
                    placeholder="Min amount"
                    value={filters.amountMin}
                    onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amountMax">Max Amount</Label>
                  <Input
                    id="amountMax"
                    type="number"
                    placeholder="Max amount"
                    value={filters.amountMax}
                    onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                  <Input
                    id="vehicleNumber"
                    placeholder="Search vehicle..."
                    value={filters.vehicleNumber}
                    onChange={(e) => handleFilterChange('vehicleNumber', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="loadTypeId">Load Type</Label>
                  <Input
                    id="loadTypeId"
                    placeholder="Search load type..."
                    value={filters.loadTypeId}
                    onChange={(e) => handleFilterChange('loadTypeId', e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No payments found matching your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vehicles</TableHead>
                      <TableHead>Load Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell className="font-mono text-sm">
                          {payment.razorpay_payment_id}
                        </TableCell>
                        <TableCell>{payment.vendorName}</TableCell>
                        <TableCell>{payment.companyName}</TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "Paid"
                                ? "default"
                                : payment.status === "Pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatToIST(payment.date)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {payment.vehicleNumbers.map((vehicle, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {vehicle}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{payment.loadTypeName || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {pagination && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{' '}
                      {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} of{' '}
                      {pagination.totalCount} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFilterChange('page', String(pagination.currentPage - 1))}
                        disabled={!pagination.hasPrevPage}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFilterChange('page', String(pagination.currentPage + 1))}
                        disabled={!pagination.hasNextPage}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 