import type { ConversationMemoryDto } from "@voicenexus/contracts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ConversationMemoryList({
  memories,
}: Readonly<{
  memories: ConversationMemoryDto[];
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation memories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {memories.map((memory) => (
          <div className="rounded-2xl border p-4" key={memory.id}>
            <div className="flex flex-wrap gap-2">
              <Badge>{memory.source}</Badge>
              <Badge variant="secondary">{memory.sentiment}</Badge>
              <Badge variant="outline">Importance {memory.importance}/5</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">{memory.content}</p>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(memory.createdAt).toLocaleString()}</p>
          </div>
        ))}
        {memories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Conversation memories appear after calls, WhatsApp, email, or notes are captured.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
