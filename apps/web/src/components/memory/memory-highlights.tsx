import type { CustomerMemoryDto } from "@voicenexus/contracts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MemoryHighlights({ memories }: Readonly<{ memories: CustomerMemoryDto[] }>) {
  const highlights = memories
    .filter((memory) => memory.relationshipScore >= 70 || memory.relationshipScore <= 35)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Important memory highlights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {highlights.map((memory) => (
          <div className="rounded-2xl border p-4" key={memory.id}>
            <p className="text-sm font-medium">
              {memory.relationshipScore >= 70 ? "Strong relationship" : "Needs attention"} · {memory.relationshipScore}/100
            </p>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{memory.summary}</p>
          </div>
        ))}
        {highlights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Highlights appear when customer relationships become especially strong or need attention.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
