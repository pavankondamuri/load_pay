import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { IndianRupee } from "lucide-react";

export function PaymentMethod() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <IndianRupee className="mr-2 h-4 w-4" />
            Cash Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 