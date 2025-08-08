import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon,
  Calendar as CalendarIcon,
  Filter,
  Zap,
  Activity,
  Target,
  BarChart3 as BarChartIcon,
  Clock,
  DollarSign,
  ChevronDown,
  X,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface ExpenseData {
  loadType: string;
  amount: number;
}

interface PaymentTrend {
  date: string;
  amount: number;
  count: number;
}

interface ExpenseChartProps {
  data: ExpenseData[];
  trendData?: PaymentTrend[];
  title?: string;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  onFilterChange?: (filter: string) => void;
  isLoading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const QUICK_FILTERS = [
  { label: 'Last 7 days', icon: Zap, days: 7 },
  { label: 'Last 30 days', icon: Activity, days: 30 },
  { label: 'This month', icon: CalendarIcon, type: 'this-month' },
  { label: 'Last month', icon: BarChartIcon, type: 'last-month' },
  { label: 'Last year', icon: Target, type: 'last-year' },
];

const CHART_FILTERS = [
  { key: 'all', label: 'All Data', icon: BarChart3 },
  { key: 'load-types', label: 'By Load Type', icon: TrendingUp },
  { key: 'trends', label: 'Payment Trends', icon: LineChartIcon },
  { key: 'comparison', label: 'Comparison', icon: PieChartIcon },
];

export function ExpenseChart({ 
  data, 
  trendData, 
  title = "Expense Overview", 
  dateRange,
  onDateRangeChange,
  onFilterChange,
  isLoading = false
}: ExpenseChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie'>('bar');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCalendar, setShowCalendar] = useState(false);
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", { 
      timeZone: "Asia/Kolkata",
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleQuickFilter = (filter: typeof QUICK_FILTERS[0]) => {
    const to = new Date();
    let from = new Date();

    if (filter.type === 'this-month') {
      from = new Date(to.getFullYear(), to.getMonth(), 1);
    } else if (filter.type === 'last-month') {
      from = new Date(to.getFullYear(), to.getMonth() - 1, 1);
      to.setDate(0); // Last day of previous month
    } else if (filter.type === 'last-year') {
      from.setFullYear(from.getFullYear() - 1);
    } else if (filter.days) {
      from.setDate(from.getDate() - filter.days);
    }

    onDateRangeChange?.({ from, to });
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg backdrop-blur-sm">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-primary font-bold">
            {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload?.count && (
            <p className="text-xs text-muted-foreground">
              {payload[0].payload.count} payments
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="text-center space-y-4">
            <div className="relative">
              <RefreshCw className="h-12 w-12 mx-auto animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          <div className="text-center space-y-4">
            <div className="relative">
              <TrendingUp className="h-16 w-16 mx-auto opacity-50" />
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-primary/30"></div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">No Payment Data Yet</p>
              <p className="text-sm">Start logging payments to see your expense breakdown</p>
            </div>
          </div>
        </div>
      );
    }

    const chartHeight = 300;

    switch (chartType) {
      case 'bar':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="loadType" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'line':
        return trendData ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone"
                  dataKey="amount" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            <div className="text-center space-y-2">
              <LineChartIcon className="h-12 w-12 mx-auto opacity-50" />
              <p>Trend data not available</p>
            </div>
          </div>
        );

      case 'area':
        return trendData ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone"
                  dataKey="amount" 
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            <div className="text-center space-y-2">
              <TrendingUp className="h-12 w-12 mx-auto opacity-50" />
              <p>Trend data not available</p>
            </div>
          </div>
        );

      case 'pie':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ loadType, percent }) => `${loadType} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center space-x-2 text-xl font-bold">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span>{title}</span>
            </CardTitle>
            {totalAmount > 0 && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">
                    Total: {formatCurrency(totalAmount)}
                  </span>
                </div>
                {dateRange?.from && dateRange?.to && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Chart Type Buttons */}
            <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant={chartType === 'bar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="h-8 w-8 p-0"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-8 w-8 p-0"
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('area')}
                className="h-8 w-8 p-0"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('pie')}
                className="h-8 w-8 p-0"
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Button */}
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/20 hover:border-primary/40 transition-all duration-200"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 flex border-blue-500/30 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900" align="end">
                <div className="flex flex-col space-y-1 border-r border-blue-200 dark:border-blue-700 pr-3 pl-2 py-2 bg-blue-50/50 dark:bg-blue-950/50">
                  {QUICK_FILTERS.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <Button
                        key={filter.label}
                        onClick={() => {
                          handleQuickFilter(filter);
                          setShowCalendar(false);
                        }}
                        variant="ghost"
                        className="justify-start font-normal hover:bg-blue-500/20 text-blue-700 dark:text-blue-300"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {filter.label}
                      </Button>
                    );
                  })}
                </div>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    onDateRangeChange?.(range);
                    setShowCalendar(false);
                  }}
                  numberOfMonths={2}
                  captionLayout="dropdown-buttons"
                  fromYear={new Date().getFullYear() - 10}
                  toYear={new Date().getFullYear()}
                  className="border-0 bg-white dark:bg-gray-900"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-2 pt-2">
          {CHART_FILTERS.map((filter) => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange(filter.key)}
                className="h-7 px-3 text-xs"
              >
                <Icon className="mr-1 h-3 w-3" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {renderChart()}
      </CardContent>
    </Card>
  );
}