import type { CustomerMemoryDto } from "@voicenexus/contracts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RelationshipScore } from "@/components/memory/relationship-score";

export function MemoryCard({ memory }: Readonly<{ memory: CustomerMemoryDto }>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Lead memory</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Lead ID: {memory.leadId}</p>
          </div>
          {memory.lastInteractionAt ? (
            <Badge variant="outline">{new Date(memory.lastInteractionAt).toLocaleDateString()}</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <RelationshipScore score={memory.relationshipScore} />
        <p className="text-sm leading-6 text-slate-700">{memory.summary}</p>
        <div className="flex flex-wrap gap-2">
          {memory.memoryTags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
          {memory.memoryTags.length === 0 ? (
            <span className="text-xs text-muted-foreground">No memory tags assigned.</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
