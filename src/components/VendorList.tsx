import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Search, CreditCard, ChevronDown, Pencil, Trash2 } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  accountHolderName: string;
  bankAccountNumber: string;
  ifscCode: string;
  phoneNumber: string;
  vehicleNumbers: string[];
}

interface SelectedVehicleNumbers {
  [vendorId: string]: string;
}

interface LoadType {
  id: string;
  name: string;
}

interface VendorListProps {
  vendors: Vendor[];
  loadTypes?: LoadType[];
  onEditVendor?: (vendor: Vendor) => void;
  onPayVendor?: (vendor: Vendor) => void;
  onDeleteVendor?: (vendorId: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

export function VendorList({ vendors, searchTerm, onSearchTermChange, onEditVendor, onPayVendor, onDeleteVendor }: VendorListProps) {
  const [selectedVehicleNumbers, setSelectedVehicleNumbers] = useState<SelectedVehicleNumbers>({});

  const handleVehicleNumberSelect = (vendorId: string, vehicleNumber: string) => {
    setSelectedVehicleNumbers(prev => ({ ...prev, [vendorId]: vehicleNumber }));
  };

  if (vendors.length === 0 && searchTerm === "") {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Vendors Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Add your first vendor using the "Add Vendor" button. Vendors are global and can be used across all your companies.
        </p>
      </div>
    );
  }

  const showActionsColumn = onEditVendor || onPayVendor || onDeleteVendor;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">All Vendors</h2>
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Global Vendor List</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Vehicle Number</TableHead>
                <TableHead>Account Holder</TableHead>
                <TableHead className="text-right">Account Number</TableHead>
                <TableHead className="text-right">IFSC Code</TableHead>
                <TableHead className="text-right">Phone Number</TableHead>
                {showActionsColumn && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>
                    {vendor.vehicleNumbers && vendor.vehicleNumbers.length > 0 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between font-normal">
                            {selectedVehicleNumbers[vendor.id] || vendor.vehicleNumbers[0]}
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                          {vendor.vehicleNumbers.map((vn, index) => (
                            <DropdownMenuItem key={index} onSelect={() => handleVehicleNumberSelect(vendor.id, vn)}>{vn}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{vendor.accountHolderName}</TableCell>
                  <TableCell className="font-mono text-right">{vendor.bankAccountNumber}</TableCell>
                  <TableCell className="font-mono text-sm text-right">{vendor.ifscCode}</TableCell>
                  <TableCell className="text-right">{vendor.phoneNumber}</TableCell>
                  {showActionsColumn && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {onPayVendor && (
                          <Button variant="outline" size="sm" onClick={() => onPayVendor(vendor)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay
                          </Button>
                        )}
                        {onEditVendor && (
                          <Button variant="ghost" size="icon" onClick={() => onEditVendor(vendor)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDeleteVendor && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
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
                                <AlertDialogAction onClick={() => onDeleteVendor(vendor.id)}>
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 