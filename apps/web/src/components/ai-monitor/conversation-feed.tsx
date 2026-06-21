import type { AiConversationDto, AiMessageDto } from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ConversationFeed({
  conversation,
  messages,
}: Readonly<{
  conversation: AiConversationDto | undefined;
  messages: AiMessageDto[];
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Runtime transcript & AI reasoning</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {conversation ? (
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium">Latest AI response</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {conversation.state.lastResponse ?? "Waiting for response generation."}
            </p>
          </div>
        ) : null}
        <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
          {messages.map((message) => (
            <div className="rounded-2xl border p-4" key={message.id}>
              <div className="flex items-center justify-between">
                <Badge variant={message.role === "assistant" ? "default" : "outline"}>{message.role}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleString()} · {message.tokens} tokens
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
            </div>
          ))}
          {!messages.length ? <p className="text-sm text-muted-foreground">No AI messages for the selected session yet.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
