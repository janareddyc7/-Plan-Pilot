import { Compass } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="p-8 sm:p-12">
      <Compass className="mb-6 text-primary" size={30} />
      <CardTitle>{title}</CardTitle>
      <CardDescription className="max-w-xl">{description}</CardDescription>
    </Card>
  );
}
