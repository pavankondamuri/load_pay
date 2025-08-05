import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { vendorAPI } from "@/lib/api";

export function AddVendorDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [vehicleNumbers, setVehicleNumbers] = useState([""]);
  const [isLoading, setIsLoading] = useState(false);

  const validateIfscCode = (code: string) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !accountHolderName.trim() || !accountNumber.trim() || !ifscCode.trim() || !phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!validateIfscCode(ifscCode.trim())) {
      toast({
        title: "Error",
        description: "Please enter a valid IFSC code.",
        variant: "destructive",
      });
      return;
    }
    // id: string;
    // name: string;
    // accountHolderName: string;
    // accountNumber: string;
    // ifscCode: string;
    // phoneNumber: string;
    // vechicleNumber: string[];

    setIsLoading(true);
    try {
      const response = await vendorAPI.create({
        name: name.trim(),
        accountHolderName: accountHolderName.trim(),
        accountNumber: parseInt(accountNumber.trim()),
        ifscCode: ifscCode.trim().toUpperCase(),
        phoneNumber: parseInt(phoneNumber.trim()),
        vechicleNumber: vehicleNumbers.filter(vn => vn.trim() !== ''),
      });

      if (response.status === 201) {
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
          description: `${name} has been added successfully.`,
        });
      }
    } catch (error: any) {
      console.error("Error adding vendor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicleNumber = () => {
    setVehicleNumbers([...vehicleNumbers, ""]);
  };

  const handleRemoveVehicleNumber = (index: number) => {
    if (vehicleNumbers.length > 1) {
      setVehicleNumbers(vehicleNumbers.filter((_, i) => i !== index));
    }
  };

  const handleVehicleNumberChange = (index: number, value: string) => {
    const newVehicleNumbers = [...vehicleNumbers];
    newVehicleNumbers[index] = value;
    setVehicleNumbers(newVehicleNumbers);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Vendor
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter vendor name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name *</Label>
              <Input
                id="accountHolderName"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Enter account holder name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                type="number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code *</Label>
              <Input
                id="ifscCode"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="Enter IFSC code"
                maxLength={11}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Vehicle Numbers</Label>
              {vehicleNumbers.map((vehicleNumber, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={vehicleNumber}
                    onChange={(e) => handleVehicleNumberChange(index, e.target.value)}
                    placeholder={`Vehicle number ${index + 1}`}
                  />
                  {vehicleNumbers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
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
                onClick={handleAddVehicleNumber}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle Number
              </Button>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Vendor"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}