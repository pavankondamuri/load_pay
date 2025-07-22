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
import { CreditCard, IndianRupee, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: {
    id: string;
    name: string;
    paymentMethod?: "bank_transfer";
    accountHolderName?: string;
    bankAccountNumber?: string;
    ifscCode?: string;
    phoneNumber?: string;
    vehicleNumbers?: string[];
  };
  loadTypes: Array<{ id: string; name: string; }>;
  onLogPayment: (payment: { vendorId: string; amount: number; loadTypeId: string; }) => void;
  onUpdateVendor: (vendor: Omit<PaymentDialogProps['vendor'], 'paymentMethod'>) => void;
  onDeleteVendor: (vendorId: string) => void;
  startInEditMode?: boolean;
  showPaymentFields?: boolean;
}

export function PaymentDialog({ open, onOpenChange, vendor, loadTypes, onLogPayment, onUpdateVendor, onDeleteVendor, startInEditMode = false, showPaymentFields = true }: PaymentDialogProps) {
  const [amount, setAmount] = useState("");
  const [loadTypeId, setLoadTypeId] = useState("");
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [editedVendor, setEditedVendor] = useState(vendor);

  useEffect(() => {
    setEditedVendor(vendor);
    setIsEditing(startInEditMode);
  }, [vendor, open, startInEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!loadTypeId) {
      toast({
        title: "Error",
        description: "Please select a load type",
        variant: "destructive",
      });
      return;
    }

    onLogPayment({
      vendorId: vendor.id,
      amount: numAmount,
      loadTypeId,
    });

    setAmount("");
    setLoadTypeId("");
    onOpenChange(false);
    
    toast({
      title: "Payment Logged",
      description: `₹${numAmount.toLocaleString()} payment to ${vendor.name} has been logged`,
    });
  };

  const formatAmount = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? "0" : num.toLocaleString();
  };
  
  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedVendor(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveVendor = () => {
    const { paymentMethod, ...vendorToUpdate } = editedVendor;
    onUpdateVendor(vendorToUpdate);
    setIsEditing(false);
    toast({
      title: "Vendor Updated",
      description: "Vendor details have been successfully updated.",
    });
    onOpenChange(false);
  };

  const handleDeleteVendor = () => {
    onDeleteVendor(vendor.id);
    onOpenChange(false);
    toast({
      title: "Vendor Deleted",
      description: `${vendor.name} has been removed.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Log Payment to {vendor.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="bg-muted/30 p-4 rounded-lg space-y-2 relative">
            {!isEditing ? (
              <div className="cursor-pointer group" onClick={() => setIsEditing(true)}>
                <div className="absolute top-4 right-4">
                  <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <>
                  <div className="text-sm text-muted-foreground">Account Holder</div>
                  <div className="font-medium">{editedVendor.accountHolderName}</div>
                  <div className="text-sm text-muted-foreground">Account Number</div>
                  <div className="font-mono text-sm break-words">{editedVendor.bankAccountNumber}</div>
                  <div className="text-sm text-muted-foreground">IFSC Code</div>
                  <div className="font-mono text-sm break-words">{editedVendor.ifscCode}</div>
                </>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Vendor Name</Label>
                  <Input id="name" name="name" value={editedVendor.name || ''} onChange={handleVendorChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="accountHolderName">Account Holder</Label>
                  <Input id="accountHolderName" name="accountHolderName" value={editedVendor.accountHolderName || ''} onChange={handleVendorChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bankAccountNumber">Account Number</Label>
                  <Input id="bankAccountNumber" name="bankAccountNumber" value={editedVendor.bankAccountNumber || ''} onChange={handleVendorChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input id="ifscCode" name="ifscCode" value={editedVendor.ifscCode || ''} onChange={handleVendorChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" name="phoneNumber" value={editedVendor.phoneNumber || ''} onChange={handleVendorChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vehicleNumbers">Vehicle Numbers</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vehicle number" />
                    </SelectTrigger>
                    <SelectContent>
                      {editedVendor.vehicleNumbers?.map((vn, index) => (
                        <SelectItem key={index} value={vn}>{vn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex items-center gap-1">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this
                          vendor and all associated payments.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteVendor}>
                          Yes, delete vendor
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleSaveVendor}>Save</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {showPaymentFields && !isEditing && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="amount" className="text-lg font-medium">Payment Amount</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="text-2xl font-bold h-16 pl-12 text-center"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                {amount && (
                  <div className="text-center text-sm text-muted-foreground">
                    ₹{formatAmount(amount)}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="loadType">Load Type</Label>
                <Select value={loadTypeId} onValueChange={setLoadTypeId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a load type" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadTypes.map((loadType) => (
                      <SelectItem key={loadType.id} value={loadType.id}>
                        {loadType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </form>
          )}
        </div>

        {showPaymentFields && !isEditing ? (
          <div className="flex space-x-2 pt-4 mt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={!amount || !loadTypeId}
              onClick={handleSubmit}
            >
              Log Payment of ₹{amount ? formatAmount(amount) : "0"}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}