import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EditVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: {
    _id?: string;
    id?: string;
    name: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    phoneNumber?: string;
    vehicleNumbers?: string[];
    vechicleNumber?: string[];
  };
  onUpdateVendor: (vendor: Omit<EditVendorDialogProps['vendor'], 'paymentMethod'>) => void;
  onDeleteVendor: (vendorId: string) => void;
}

export function EditVendorDialog({ open, onOpenChange, vendor, onUpdateVendor, onDeleteVendor }: EditVendorDialogProps) {
  const [editedVendor, setEditedVendor] = useState(vendor);
  const [newVehicleNumber, setNewVehicleNumber] = useState("");

  useEffect(() => {
    // Initialize editedVendor with proper vehicle numbers
    const vehicleNumbers = vendor.vehicleNumbers || vendor.vechicleNumber || [];
    setEditedVendor({
      ...vendor,
      vehicleNumbers: vehicleNumbers
    });
    setNewVehicleNumber("");
  }, [vendor, open]);

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
    onOpenChange(false);
  };

  const handleDeleteVendor = () => {
    const vendorId = vendor._id || vendor.id;
    if (vendorId) {
      onDeleteVendor(vendorId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Pencil className="h-5 w-5" />
            <span>Edit Vendor - {vendor.name}</span>
          </DialogTitle>
        </DialogHeader>

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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVendor}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 