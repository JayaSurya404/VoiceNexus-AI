import type { AgentDecisionDto, ToolExecutionDto } from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DecisionTimeline({
  decisions,
  tools,
}: Readonly<{
  decisions: AgentDecisionDto[];
  tools: ToolExecutionDto[];
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Decision timeline & tool calls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {decisions.map((decision) => (
          <div className="border-l-2 border-slate-200 pl-4" key={decision.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{decision.decision}</p>
              <Badge variant="outline">{decision.type}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {decision.state} · {Math.round(decision.confidence * 100)}% · {new Date(decision.createdAt).toLocaleString()}
            </p>
            <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">{decision.reasoning}</p>
          </div>
        ))}

        {tools.map((tool) => (
          <div className="rounded-2xl border p-4" key={tool.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{tool.toolName}</p>
              <Badge variant={tool.success ? "default" : "destructive"}>{tool.success ? "SUCCESS" : "FAILED"}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(tool.executedAt).toLocaleString()}</p>
            <pre className="mt-3 max-h-32 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-white">
              {JSON.stringify(tool.success ? tool.output : { error: tool.error }, null, 2)}
            </pre>
          </div>
        ))}

        {!decisions.length && !tools.length ? (
          <p className="text-sm text-muted-foreground">
            Runtime decisions and persisted tool calls will appear here as transcripts are processed.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
