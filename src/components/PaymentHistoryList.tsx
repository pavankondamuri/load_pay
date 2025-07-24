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
import { IndianRupee } from "lucide-react";

const PaymentHistoryList = () => {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const storedPayments = JSON.parse(
      localStorage.getItem("payments") || "[]"
    );
    setPayments(storedPayments);
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

  return (
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
        {payments.length > 0 ? (
          payments.map((payment: Payment) => (
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
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No payments found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default PaymentHistoryList; 