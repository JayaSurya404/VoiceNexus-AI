import type { CallStatus } from "@voicenexus/contracts";

import { Badge } from "@/components/ui/badge";

export function CallStatusBadge({ status }: Readonly<{ status: CallStatus }>) {
  const variant = status === "COMPLETED" ? "secondary" : status === "FAILED" ? "destructive" : "outline";

  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>;
}
