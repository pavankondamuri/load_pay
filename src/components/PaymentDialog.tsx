import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, IndianRupee } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { paymentAPI } from "@/lib/api";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: {
    _id?: string;
    id?: string;
    name: string;
    paymentMethod?: "bank_transfer";
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    phoneNumber?: string;
    vehicleNumbers?: string[];
    vechicleNumber?: string[];
  };
  loadTypes: Array<{ _id: string; name: string; }>;
  company?: {
    _id?: string;
    companyName: string;
  };
  onLogPayment?: (payment: { vendorId: string; amount: number; loadTypeId:string, vehicleNumber?: string; }) => void;
}

// Razorpay script loader
function loadRazorpayScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PaymentDialog({ open, onOpenChange, vendor, loadTypes, company, onLogPayment }: PaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [loadTypeId, setLoadTypeId] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);

  useEffect(() => {
    setAmount("");
    setLoadTypeId("");
    setSelectedVehicles([]);
  }, [vendor, open]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };

  const handleVehicleSelection = (vehicleNumber: string, checked: boolean) => {
    if (checked) {
      setSelectedVehicles(prev => [...prev, vehicleNumber]);
    } else {
      setSelectedVehicles(prev => prev.filter(v => v !== vehicleNumber));
    }
  };

  const handleSelectAllVehicles = (checked: boolean) => {
    const allVehicles = vendor.vehicleNumbers || vendor.vechicleNumber || [];
    if (checked) {
      setSelectedVehicles(allVehicles);
    } else {
      setSelectedVehicles([]);
    }
  };

  const handlePayWithRazorpay = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount." });
      return;
    }

    if (!loadTypeId) {
      toast({ title: "Load Type Required", description: "Please select a load type." });
      return;
    }

    if (selectedVehicles.length === 0) {
      toast({ title: "Vehicle Selection Required", description: "Please select at least one vehicle." });
      return;
    }

    // Get load type name
    const selectedLoadType = loadTypes.find(lt => lt._id === loadTypeId);
    const loadTypeName = selectedLoadType?.name || "";

    // Load Razorpay script
    const res = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      toast({ title: "Razorpay SDK failed to load" });
      return;
    }
    
    // Create order on backend
    try {
      const orderRes = await paymentAPI.createOrder({
        amount: Number(amount),
        currency: "INR",
        notes: {
          vendorName: vendor.name,
          vendorId: vendor._id || vendor.id,
          companyName: company?.companyName || "Unknown Company",
          companyId: company?._id,
          accountHolderName: vendor.accountHolderName,
          accountNumber: vendor.accountNumber,
          ifscCode: vendor.ifscCode,
          vehicleNumbers: selectedVehicles,
          loadTypeId,
          loadTypeName,
        },
      });
      const order = orderRes.data;
      
      // Get Razorpay key from environment or use a placeholder
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_vD4d9vn4KvOa5t";
      
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: vendor.name,
        description: `Payment for ${company?.companyName || 'Company'} - ${vendor.name}`,
        order_id: order.id,
        handler: async function (response: any) {
          // Call backend to verify payment and store history
          try {
            const verifyRes = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: Number(amount),
              vendorName: vendor.name,
              vendorId: vendor._id || vendor.id,
              companyName: company?.companyName || "Unknown Company",
              companyId: company?._id,
              accountHolderName: vendor.accountHolderName,
              accountNumber: vendor.accountNumber,
              ifscCode: vendor.ifscCode,
              vehicleNumbers: selectedVehicles,
              loadTypeId,
              loadTypeName,
            });
            toast({ title: "Payment Success", description: `Payment verified and logged! Payment ID: ${response.razorpay_payment_id}` });
          } catch (err: any) {
            toast({ title: "Verification Error", description: err?.response?.data?.message || err.message });
          }
          onOpenChange(false);
        },
        prefill: {
          name: vendor.accountHolderName,
          email: "", // Optionally add email
          contact: vendor.phoneNumber || "",
        },
        notes: order.notes,
        theme: { color: "#3399cc" },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast({ title: "Payment Error", description: err?.response?.data?.error || err.message });
    }
  };

  const allVehicles = vendor.vehicleNumbers || vendor.vechicleNumber || [];
  const allSelected = allVehicles.length > 0 && selectedVehicles.length === allVehicles.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Log Payment - {vendor.name}</span>
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handlePayWithRazorpay(); }}>
          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input 
              id="amount" 
              value={amount} 
              onChange={handleAmountChange} 
              placeholder="Enter amount" 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="loadType">Load Type</Label>
            <Select value={loadTypeId} onValueChange={setLoadTypeId} required>
              <SelectTrigger id="loadType">
                <SelectValue placeholder="Select load type" />
              </SelectTrigger>
              <SelectContent>
                {loadTypes.map(type => (
                  <SelectItem key={type._id} value={type._id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {company && (
            <div>
              <Label>Company</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">{company.companyName}</p>
              </div>
            </div>
          )}
          
          {allVehicles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all" 
                  checked={allSelected}
                  onCheckedChange={handleSelectAllVehicles}
                />
                <Label htmlFor="select-all" className="font-medium">Select Vehicles</Label>
              </div>
              
              <div className="space-y-2">
                {allVehicles.map((vehicle, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`vehicle-${index}`}
                      checked={selectedVehicles.includes(vehicle)}
                      onCheckedChange={(checked) => handleVehicleSelection(vehicle, checked as boolean)}
                    />
                    <Label htmlFor={`vehicle-${index}`} className="flex-1">
                      {vehicle}
                    </Label>
                  </div>
                ))}
              </div>
              
              {selectedVehicles.length > 0 && (
                <div className="p-3 bg-muted rounded-md">
                  <Label className="text-sm font-medium">Selected Vehicles:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVehicles.map((vehicle, index) => (
                      <Badge key={index} variant="secondary">{vehicle}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay with Razorpay
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}