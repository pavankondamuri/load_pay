import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function PaymentMethodsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Methods</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page will display all available payment methods.</p>
        </CardContent>
      </Card>
    </div>
  );
} 