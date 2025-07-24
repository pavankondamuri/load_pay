export type Payment = {
  id: string;
  vendorName: string;
  amount: number;
  date: string;
  status: "Paid" | "Pending" | "Failed";
  vehicleNumber?: string;
};

export const payments: Payment[] = [
  {
    id: "PAY-001",
    vendorName: "Amazon Web Services",
    amount: 250.0,
    date: "2024-07-15",
    status: "Paid",
    vehicleNumber: "AB-12-CD-3456",
  },
  {
    id: "PAY-002",
    vendorName: "Slack",
    amount: 50.0,
    date: "2024-07-14",
    status: "Paid",
    vehicleNumber: "EF-34-GH-7890",
  },
  {
    id: "PAY-003",
    vendorName: "Figma",
    amount: 75.0,
    date: "2024-07-13",
    status: "Pending",
    vehicleNumber: "IJ-56-KL-1234",
  },
  {
    id: "PAY-004",
    vendorName: "Vercel",
    amount: 100.0,
    date: "2024-07-12",
    status: "Failed",
    vehicleNumber: "MN-78-OP-5678",
  },
  {
    id: "PAY-005",
    vendorName: "GitHub",
    amount: 25.0,
    date: "2024-07-11",
    status: "Paid",
    vehicleNumber: "QR-90-ST-9012",
  },
]; 