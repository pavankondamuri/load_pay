import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Vendor {
  id: string;
  name: string;
  accountHolderName: string;
  bankAccountNumber: string;
  ifscCode: string;
  phoneNumber: string;
  vehicleNumbers: string[];
}

interface EditVendorDialogProps {
  vendor: Vendor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditVendor: (vendorData: Vendor) => void;
}

export function EditVendorDialog({ vendor, open, onOpenChange, onEditVendor }: EditVendorDialogProps) {
  const [name, setName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [vehicleNumbers, setVehicleNumbers] = useState<string[]>([""]);

  useEffect(() => {
    if (vendor) {
      setName(vendor.name);
      setAccountHolderName(vendor.accountHolderName);
      setBankAccountNumber(vendor.bankAccountNumber);
      setIfscCode(vendor.ifscCode);
      setPhoneNumber(vendor.phoneNumber);
      setVehicleNumbers(vendor.vehicleNumbers.length > 0 ? vendor.vehicleNumbers : [""]);
    }
  }, [vendor]);

  const handleAddVehicleNumber = () => {
    setVehicleNumbers([...vehicleNumbers, ""]);
  };

  const handleRemoveVehicleNumber = (index: number) => {
    const newVehicleNumbers = vehicleNumbers.filter((_, i) => i !== index);
    setVehicleNumbers(newVehicleNumbers);
  };

  const handleVehicleNumberChange = (index: number, value: string) => {
    const newVehicleNumbers = [...vehicleNumbers];
    newVehicleNumbers[index] = value;
    setVehicleNumbers(newVehicleNumbers);
  };

  const validateAccountHolderName = (value: string) => {
    return /^[a-zA-Z\s]+$/.test(value);
  };

  const validateBankAccountNumber = (value: string) => {
    return /^\d+$/.test(value);
  };

  const validatePhoneNumber = (value: string) => {
    return /^\d{10}$/.test(value);
  };

  const validateIfscCode = (value: string) => {
    // IFSC format: 4 letters + 1 zero + 6 alphanumeric characters
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    // Validate all required fields
    if (!name.trim() || !accountHolderName.trim() || !bankAccountNumber.trim() || !ifscCode.trim() || !phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate account holder name format
    if (!validateAccountHolderName(accountHolderName.trim())) {
      toast({
        title: "Error",
        description: "Account holder name should only contain letters and spaces.",
        variant: "destructive",
      });
      return;
    }

    // Validate bank account number format
    if (!validateBankAccountNumber(bankAccountNumber.trim())) {
      toast({
        title: "Error",
        description: "Bank account number should only contain numbers.",
        variant: "destructive",
      });
      return;
    }

    // Validate IFSC code format
    if (!validateIfscCode(ifscCode.trim())) {
      toast({
        title: "Error",
        description: "Invalid IFSC code format. It should be in the format: ABCD0123456",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber.trim())) {
      toast({
        title: "Error",
        description: "Phone number should be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    onEditVendor({
      ...vendor,
      name: name.trim(),
      accountHolderName: accountHolderName.trim(),
      bankAccountNumber: bankAccountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      phoneNumber: phoneNumber.trim(),
      vehicleNumbers: vehicleNumbers.filter(vn => vn.trim() !== '')
    });
    onOpenChange(false);
    toast({
      title: "Vendor Updated",
      description: `${name} has been updated successfully.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
          <DialogDescription>
            Update the details for this vendor.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 pr-6">
            <div className="space-y-1">
              <Label htmlFor="edit-name">Vendor Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-accountHolderName">Account Holder Name</Label>
              <Input
                id="edit-accountHolderName"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-bankAccountNumber">Bank Account Number</Label>
              <Input
                id="edit-bankAccountNumber"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-ifscCode">IFSC Code</Label>
              <Input
                id="edit-ifscCode"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABCD0123456"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-phoneNumber">Phone Number</Label>
              <Input
                id="edit-phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
                placeholder="10-digit phone number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Vehicle Numbers</Label>
              {vehicleNumbers.map((vehicleNumber, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={vehicleNumber}
                    onChange={(e) =>
                      handleVehicleNumberChange(index, e.target.value)
                    }
                    placeholder={`Vehicle Number ${index + 1}`}
                  />
                  {vehicleNumbers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveVehicleNumber(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVehicleNumber}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Vehicle
              </Button>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 