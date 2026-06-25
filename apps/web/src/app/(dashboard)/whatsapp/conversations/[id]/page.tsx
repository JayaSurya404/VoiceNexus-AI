"use client";

import { useParams } from "next/navigation";
import { Bot, CheckCircle2, Send } from "lucide-react";

import { WhatsappEmptyState } from "@/components/whatsapp/whatsapp-empty-state";
import { WhatsappStatusBadge } from "@/components/whatsapp/whatsapp-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSendWhatsappMessage, useUpdateWhatsappConversation, useWhatsappConversation } from "@/hooks/use-whatsapp";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function WhatsappConversationDetailsPage() {
  const params = useParams<{ id: string }>();
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const conversationQuery = useWhatsappConversation(activeOrganizationId, params.id);
  const sendMessage = useSendWhatsappMessage();
  const updateConversation = useUpdateWhatsappConversation();

  if (!activeOrganizationId) {
    return <WhatsappEmptyState title="No organization selected" description="Select an organization before opening a WhatsApp chat." />;
  }

  const organizationId = activeOrganizationId;
  const details = conversationQuery.data;

  function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    sendMessage.mutate({
      organizationId,
      conversationId: params.id,
      body: formString(formData, "body"),
      useAi: formData.get("useAi") === "on",
    });
    event.currentTarget.reset();
  }

  function resolveConversation() {
    updateConversation.mutate({
      id: params.id,
      input: { organizationId, status: "RESOLVED" },
    });
  }

  function toggleAi() {
    if (!details) {
      return;
    }

    updateConversation.mutate({
      id: params.id,
      input: { organizationId, aiEnabled: !details.conversation.aiEnabled },
    });
  }

  if (conversationQuery.isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (conversationQuery.isError || !details) {
    return <WhatsappEmptyState title="Conversation unavailable" description="The conversation could not be loaded." />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <Card className="min-h-[640px]">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{details.conversation.contact?.displayName ?? details.conversation.subject}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{details.conversation.contact?.phone}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <WhatsappStatusBadge status={details.conversation.status} />
              <Button onClick={toggleAi} type="button" variant="outline">
                <Bot className="h-4 w-4" /> {details.conversation.aiEnabled ? "Disable AI" : "Enable AI"}
              </Button>
              <Button onClick={resolveConversation} type="button" variant="outline">
                <CheckCircle2 className="h-4 w-4" /> Resolve
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-[560px] flex-col p-0">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {details.messages.map((message) => (
              <div
                className={message.direction === "OUTBOUND" ? "ml-auto max-w-[78%] text-right" : "mr-auto max-w-[78%]"}
                key={message.id}
              >
                <div
                  className={
                    message.direction === "OUTBOUND"
                      ? "rounded-2xl bg-emerald-600 px-4 py-3 text-white"
                      : "rounded-2xl bg-slate-100 px-4 py-3 text-slate-900"
                  }
                >
                  <p className="text-sm leading-6">{message.body}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {message.isAiGenerated ? "AI reply" : message.direction} · {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <form className="border-t p-4" onSubmit={handleSend}>
            <Label htmlFor="body">Message</Label>
            <Textarea className="mt-2" id="body" name="body" placeholder="Type a WhatsApp reply..." required />
            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input name="useAi" type="checkbox" /> Generate as AI reply
              </label>
              <Button disabled={sendMessage.isPending} type="submit">
                <Send className="h-4 w-4" /> Send
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Runtime</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>State: {details.conversation.runtimeState.state}</p>
            <p>AI replies: {details.conversation.aiEnabled ? "Enabled" : "Disabled"}</p>
            <p>Updated: {new Date(details.conversation.runtimeState.updatedAt).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CRM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{details.lead ? details.lead.fullName : "No linked lead"}</p>
            {details.lead ? <p className="text-muted-foreground">{details.lead.status} · Score {details.lead.score}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Memory</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {details.memory ? details.memory.summary : "No customer memory has been captured for this contact yet."}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
