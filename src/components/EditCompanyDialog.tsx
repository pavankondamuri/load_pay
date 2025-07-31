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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Company {
  id?: string;
  companyName: string;
  description: string;
  ownerName?: string;
  email?: string;
  phoneNumber?: string;
  _id?: string;
}

interface EditCompanyDialogProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditCompany: (companyData: Company) => void;
}

export function EditCompanyDialog({ company, open, onOpenChange, onEditCompany }: EditCompanyDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName);
      setDescription(company.description);
      setOwnerName(company.ownerName || "");
      setEmail(company.email || "");
      setPhoneNumber(company.phoneNumber || "");
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    const trimmedName = companyName.trim();
    const trimmedDescription = description.trim();
    const trimmedOwnerName = ownerName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhoneNumber = phoneNumber.trim();

    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Company name is required.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedName.length < 2) {
      toast({
        title: "Error",
        description: "Company name must be at least 2 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!trimmedDescription) {
      toast({
        title: "Error",
        description: "Company description is required.",
        variant: "destructive",
      });
      return;
    }

    onEditCompany({
      ...company,
      companyName: trimmedName,
      description: trimmedDescription,
      ownerName: trimmedOwnerName,
      email: trimmedEmail,
      phoneNumber: trimmedPhoneNumber,
    });

    onOpenChange(false);

    toast({
      title: "Company Updated",
      description: `${trimmedName} has been updated successfully.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update the details for this company.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="edit-company-name">Company Name</Label>
            <Input
              id="edit-company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              required
              minLength={2}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-company-description">Description</Label>
            <Textarea
              id="edit-company-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a brief description of the company"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-contact-name">Contact Name</Label>
            <Input
              id="edit-contact-name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Enter contact name"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-contact-email">Contact Email</Label>
            <Input
              id="edit-contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter contact email"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-contact-phone">Contact Phone</Label>
            <Input
              id="edit-contact-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter contact phone"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 