import Link from "next/link";
import type { CallDetailsDto } from "@voicenexus/contracts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LeadMemoryLinks({ details }: Readonly<{ details: CallDetailsDto }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CRM and memory links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {details.lead ? (
          <Button asChild className="w-full" variant="outline">
            <Link href={`/crm/leads/${details.lead.id}`}>Open lead: {details.lead.fullName}</Link>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">This call is not linked to a CRM lead yet.</p>
        )}
        {details.memory ? (
          <Button asChild className="w-full" variant="outline">
            <Link href="/memory">Open customer memory</Link>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">No customer memory card exists for this call's lead yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
