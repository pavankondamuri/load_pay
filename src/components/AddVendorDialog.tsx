import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function AddVendorDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [vehicleNumbers, setVehicleNumbers] = useState<string[]>([""]);

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
    if (!name.trim() || !accountHolderName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
      toast({
        title: "Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    const newVendor = {
      id: Date.now().toString(),
      name,
      accountHolderName,
      accountNumber,
      ifscCode,
      phoneNumber,
      vehicleNumbers: vehicleNumbers.filter(vn => vn.trim() !== ''),
    };
    const allVendors = JSON.parse(localStorage.getItem("vendors") || "[]");
    localStorage.setItem("vendors", JSON.stringify([...allVendors, newVendor]));
    setOpen(false);
    // Reset form
    setName("");
    setAccountHolderName("");
    setAccountNumber("");
    setIfscCode("");
    setPhoneNumber("");
    setVehicleNumbers([""]);
    toast({
      title: "Vendor Added",
      description: `${name} has been added to the global vendor list.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto" size="lg">
          <Users className="mr-2 h-5 w-5" />
          Add Vendor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a New Global Vendor</DialogTitle>
          <DialogDescription>
            This vendor will be available across all your companies.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 pr-6">
            <div className="space-y-1">
              <Label htmlFor="name">Vendor Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
              <Input
                id="bankAccountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phoneNumber">Phone Number</Label>

              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
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
              <Button type="submit">Add Vendor</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}