import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Payment } from "@/lib/payment";
import { IndianRupee, Clock } from "lucide-react";
import axios from "axios";

const PaymentHistoryList = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    axios.get("/api/payments/history")
      .then(res => {
        // Map backend payment fields to Payment type for display
        const backendPayments = res.data.map((p: any) => ({
          id: p.id,
          vendorName: p.vendorName,
          amount: p.amount,
          date: p.date,
          status: p.status,
          vehicleNumber: Array.isArray(p.vehicleNumbers) ? p.vehicleNumbers.join(", ") : p.vehicleNumber || "",
        }));
        setPayments(backendPayments);
        setIsLoading(false);
      })
      .catch(() => {
        setPayments([]);
        setIsLoading(false);
      });
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">Payment History Coming Soon</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Payment history will be available once the payment system is fully integrated. 
            All your payment records will be securely stored and accessible here.
          </p>
        </div>
      ) : (
        <Table>
          <TableCaption>A list of your recent payments.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>          
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment: Payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.vehicleNumber}</TableCell>
                <TableCell>{payment.vendorName}</TableCell>
                <TableCell><IndianRupee className="inline-block mr-1 h-4 w-4"/>{payment.amount.toFixed(2)}</TableCell>
                <TableCell>{formatToIST(payment.date)}</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default PaymentHistoryList; 