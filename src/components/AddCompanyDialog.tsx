import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { companyAPI } from "@/lib/api";

interface AddCompanyDialogProps {
  onAddCompany?: (company: any) => void;
}

export function AddCompanyDialog({ onAddCompany }: AddCompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim() || !ownerName.trim()) {
      toast({
        title: "Error",
        description: "Company name and owner name are required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await companyAPI.create({
        companyName: companyName.trim(),
        ownerName: ownerName.trim(),
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        description: description.trim() || undefined,
      });

      if (response.status === 201) {
        const newCompany = response.data.compine;
        onAddCompany?.(newCompany);
        setOpen(false);
        
        // Reset form
        setCompanyName("");
        setOwnerName("");
        setEmail("");
        setPhoneNumber("");
        setDescription("");
        
        toast({
          title: "Company Added",
          description: `${companyName} has been added successfully.`,
        });
      }
    } catch (error: any) {
      console.error("Error adding company:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Company
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter owner name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter company description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Company"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}