import type { LeadStatus } from "@voicenexus/contracts";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusClasses: Record<LeadStatus, string> = {
  NEW: "border-sky-200 bg-sky-50 text-sky-700",
  CONTACTED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  QUALIFIED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  INTERESTED: "border-violet-200 bg-violet-50 text-violet-700",
  FOLLOW_UP: "border-amber-200 bg-amber-50 text-amber-700",
  WON: "border-green-200 bg-green-50 text-green-700",
  LOST: "border-rose-200 bg-rose-50 text-rose-700",
};

export function StatusBadge({ status }: Readonly<{ status: LeadStatus }>) {
  return (
    <Badge className={cn("border hover:bg-current/0", statusClasses[status])} variant="outline">
      {status.replace("_", " ")}
    </Badge>
  );
}
