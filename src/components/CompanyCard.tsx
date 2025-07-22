import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CompanyCardProps {
  id: string;
  name: string;
  description: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CompanyCard({ id, name, description, contactName, contactEmail, contactPhone, onView, onEdit, onDelete }: CompanyCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground pt-1">
              {description}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(id)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm text-muted-foreground">
          {contactName && (
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              <span>{contactName}</span>
            </div>
          )}
          {contactEmail && (
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              <span>{contactEmail}</span>
            </div>
          )}
          {contactPhone && (
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              <span>{contactPhone}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onView(id)} className="w-full">
          View Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
}