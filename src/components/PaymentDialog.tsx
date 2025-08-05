import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { CreditCard, IndianRupee, Pencil, Trash2, Plus, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PaymentMethod } from "./PaymentMethod";
import axios from "axios";

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
  onLogPayment?: (payment: { vendorId: string; amount: number; loadTypeId:string, vehicleNumber?: string; }) => void;
  onUpdateVendor: (vendor: Omit<PaymentDialogProps['vendor'], 'paymentMethod'>) => void;
  onDeleteVendor: (vendorId: string) => void;
  startInEditMode?: boolean;
  showPaymentFields?: boolean;
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

export function PaymentDialog({ open, onOpenChange, vendor, loadTypes, onLogPayment, onUpdateVendor, onDeleteVendor, startInEditMode = false, showPaymentFields = true }: PaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [loadTypeId, setLoadTypeId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [editedVendor, setEditedVendor] = useState(vendor);
  const [newVehicleNumber, setNewVehicleNumber] = useState("");

  useEffect(() => {
    // Initialize editedVendor with proper vehicle numbers
    const vehicleNumbers = vendor.vehicleNumbers || vendor.vechicleNumber || [];
    setEditedVendor({
      ...vendor,
      vehicleNumbers: vehicleNumbers
    });
    setIsEditing(startInEditMode);
    setVehicleNumber("");
    setNewVehicleNumber("");
  }, [vendor, open, startInEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement payment functionality when payment API is ready
    toast({
      title: "Payment System Coming Soon",
      description: "Payment functionality will be available once the payment gateway is integrated.",
    });
    
    onOpenChange(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };

  const formatAmount = (value: string) => {
    return new Intl.NumberFormat('en-IN').format(parseFloat(value) || 0);
  };

  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedVendor({ ...editedVendor, [e.target.name]: e.target.value });
  };

  const handleAddVehicleNumber = () => {
    if (newVehicleNumber.trim()) {
      const currentVehicleNumbers = editedVendor.vehicleNumbers || editedVendor.vechicleNumber || [];
      setEditedVendor({
        ...editedVendor,
        vehicleNumbers: [...currentVehicleNumbers, newVehicleNumber.trim()]
      });
      setNewVehicleNumber("");
    }
  };

  const handleRemoveVehicleNumber = (vehicleNumber: string) => {
    const currentVehicleNumbers = editedVendor.vehicleNumbers || editedVendor.vechicleNumber || [];
    setEditedVendor({
      ...editedVendor,
      vehicleNumbers: currentVehicleNumbers.filter(vn => vn !== vehicleNumber)
    });
  };

  const handleSaveVendor = () => {
    const vendorToUpdate = {
      ...editedVendor,
      accountNumber: editedVendor.accountNumber || "",
      phoneNumber: editedVendor.phoneNumber || "",
      vehicleNumbers: editedVendor.vehicleNumbers || editedVendor.vechicleNumber || [],
    };
    onUpdateVendor(vendorToUpdate);
    setIsEditing(false);
    onOpenChange(false);
  };

  const handleDeleteVendor = () => {
    const vendorId = vendor._id || vendor.id;
    if (vendorId) {
      onDeleteVendor(vendorId);
      onOpenChange(false);
    }
  };

  const handlePayWithRazorpay = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount." });
      return;
    }
    // Load Razorpay script
    const res = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      toast({ title: "Razorpay SDK failed to load" });
      return;
    }
    // Create order on backend
    try {
      const orderRes = await axios.post("/api/payments/create-order", {
        amount: Number(amount),
        currency: "INR",
        notes: {
          vendorName: vendor.name,
          accountHolderName: vendor.accountHolderName,
          accountNumber: vendor.accountNumber,
          ifscCode: vendor.ifscCode,
          vehicleNumbers: vendor.vehicleNumbers || vendor.vechicleNumber || [],
          loadTypeId,
        },
      });
      const order = orderRes.data;
      const options = {
        key: "rzp_test_vD4d9vn4KvOa5t", // fallback to test key
        amount: order.amount,
        currency: order.currency,
        name: vendor.name,
        description: "Payment for services",
        order_id: order.id,
        handler: async function (response: any) {
          // Call backend to verify payment and store history
          try {
            const verifyRes = await axios.post("/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: Number(amount),
              vendorName: vendor.name,
              accountHolderName: vendor.accountHolderName,
              accountNumber: vendor.accountNumber,
              ifscCode: vendor.ifscCode,
              vehicleNumbers: vendor.vehicleNumbers || vendor.vechicleNumber || [],
              loadTypeId,
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

  const vehicleNumbers = vendor.vehicleNumbers || vendor.vechicleNumber || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Pencil className="h-5 w-5" />
                <span>Edit Vendor</span>
              </>
            ) : showPaymentFields ? (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Log Payment - {vendor.name}</span>
              </>
            ) : (
              <>
                <Pencil className="h-5 w-5" />
                <span>Edit Vendor - {vendor.name}</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          // Edit Vendor Form
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vendor Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={editedVendor.name}
                  onChange={handleVendorChange}
                  placeholder="Enter vendor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  name="accountHolderName"
                  value={editedVendor.accountHolderName || ""}
                  onChange={handleVendorChange}
                  placeholder="Enter account holder name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={editedVendor.accountNumber || ""}
                  onChange={handleVendorChange}
                  placeholder="Enter account number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  name="ifscCode"
                  value={editedVendor.ifscCode || ""}
                  onChange={handleVendorChange}
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={editedVendor.phoneNumber || ""}
                onChange={handleVendorChange}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label>Vehicle Numbers</Label>
              {(editedVendor.vehicleNumbers || []).map((vn, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input value={vn} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveVehicleNumber(vn)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex space-x-2">
                <Input
                  value={newVehicleNumber}
                  onChange={(e) => setNewVehicleNumber(e.target.value)}
                  placeholder="Add new vehicle number"
                />
                <Button type="button" onClick={handleAddVehicleNumber}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveVendor}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : showPaymentFields ? (
          // Payment Form
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handlePayWithRazorpay(); }}>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" value={amount} onChange={handleAmountChange} placeholder="Enter amount" required />
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
            <div>
              <Label>Vehicle Numbers</Label>
              {(editedVendor.vehicleNumbers || []).map((vn, index) => (
                <Badge key={index} className="mr-2">{vn}</Badge>
              ))}
            </div>
            <Button type="submit" className="w-full mt-4">
              Pay with Razorpay
            </Button>
            <div className="flex justify-center space-x-2 mt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Vendor Instead
              </Button>
            </div>
          </form>
        ) : (
          // View Vendor Details
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Vendor Name</Label>
                <p className="text-sm">{vendor.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Holder</Label>
                <p className="text-sm">{vendor.accountHolderName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Number</Label>
                <p className="text-sm">{vendor.accountNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">IFSC Code</Label>
                <p className="text-sm">{vendor.ifscCode}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
              <p className="text-sm">{vendor.phoneNumber}</p>
            </div>
            {vehicleNumbers.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Vehicle Numbers</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {vehicleNumbers.map((vn, index) => (
                    <Badge key={index} variant="secondary">{vn}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Vendor
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {vendor.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteVendor} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}