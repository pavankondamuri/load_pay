import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

interface AddCompanyDialogProps {
  // companyName, ownerName, email, phoneNumber, description 
  onAddCompany: (company: { companyName: string; description: string,  ownerName?: string, email?: string, phoneNumber?: string, }) => void;
}

export function AddCompanyDialog({ onAddCompany }: AddCompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setphoneNumber] = useState("");


  const handleSubmit =  async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const response = await axios.post("http://localhost:3000/api/company/create",{companyName,description,ownerName,email,phoneNumber},
          {
            headers:{
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(response,"response")
        if(response.status===201){
          onAddCompany({ companyName: companyName.trim(), description: description.trim(), ownerName: ownerName.trim(), email: email.trim(), phoneNumber: phoneNumber.trim()});
            toast({
                title: "Success",
                description: "Company added successfully",
            });
            setCompanyName("");
            setDescription("");
            setOwnerName("");
            setEmail("");
            setphoneNumber("");
            setOpen(false);
        }
    } catch (error) {
      toast({
        title: "Error",
        description: "Company not added",
        variant: "destructive",
      });
        console.log(error,"error")
    }
    // if (!name.trim()) {
    //   toast({
    //     title: "Error",
    //     description: "Company name is required",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    // onAddCompany({ name: name.trim(), description: description.trim(), OwnerName: OwnerName.trim(), email: email.trim(), phoneNumber: phoneNumber.trim()});
   
  
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="h-16 px-8">
          <Plus className="mr-2 h-5 w-5" />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Add New Company</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>
         
          <div className="space-y-2">
            <Label htmlFor="ownerName">Name (Optional)</Label>
            <Input
              id="ownerName"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Enter contact name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email"> Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter contact email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Contact Phone (Optional)</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setphoneNumber(e.target.value)}
              placeholder="Enter contact phone"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the company"
              rows={3}
            />
          </div>
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Company
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
//hhh