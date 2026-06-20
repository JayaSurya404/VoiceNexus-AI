import type { AiConversationStatus } from "@voicenexus/contracts";

import { Badge } from "@/components/ui/badge";

const variants: Record<AiConversationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  CONNECTING: "secondary",
  ACTIVE: "default",
  ENDED: "outline",
  FAILED: "destructive",
};

export function CallStateBadge({ status }: Readonly<{ status: AiConversationStatus }>) {
  return <Badge variant={variants[status]}>{status.replaceAll("_", " ")}</Badge>;
}
