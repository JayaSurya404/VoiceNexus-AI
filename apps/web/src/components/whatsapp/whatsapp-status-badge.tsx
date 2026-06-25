import { Badge } from "@/components/ui/badge";

export function WhatsappStatusBadge({
  status,
}: Readonly<{ status: string }>) {
  const variant = status === "FAILED" || status === "ARCHIVED" ? "destructive" : status === "OPEN" ? "default" : "outline";

  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>;
}
