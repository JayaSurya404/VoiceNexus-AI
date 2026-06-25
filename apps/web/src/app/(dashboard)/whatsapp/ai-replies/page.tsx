"use client";

import Link from "next/link";
import { Bot, MessageCircle } from "lucide-react";

import { WhatsappEmptyState } from "@/components/whatsapp/whatsapp-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWhatsappAutomations, useWhatsappConversations } from "@/hooks/use-whatsapp";
import { useAuthStore } from "@/store/auth-store";

export default function WhatsappAiRepliesPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const conversationsQuery = useWhatsappConversations(
    { organizationId: activeOrganizationId ?? "" },
    Boolean(activeOrganizationId),
  );
  const automationsQuery = useWhatsappAutomations(activeOrganizationId);

  if (!activeOrganizationId) {
    return <WhatsappEmptyState title="No organization selected" description="Select an organization before reviewing WhatsApp AI replies." />;
  }

  const aiEnabledConversations = (conversationsQuery.data ?? []).filter((conversation) => conversation.aiEnabled);
  const enabledAutomations = (automationsQuery.data ?? []).filter((automation) => automation.isEnabled);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-950 p-8 text-white">
        <Bot className="h-8 w-8 text-emerald-300" />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">AI Auto Replies</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Monitor conversations where AI replies are enabled and manage the active response workflows.
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="AI-enabled chats" loading={conversationsQuery.isLoading} value={aiEnabledConversations.length} />
        <Metric label="Enabled workflows" loading={automationsQuery.isLoading} value={enabledAutomations.length} />
        <Metric label="Pending agent review" loading={conversationsQuery.isLoading} value={aiEnabledConversations.filter((conversation) => conversation.status === "PENDING").length} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageCircle className="h-5 w-5 text-emerald-600" /> AI-enabled conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversationsQuery.isLoading ? <Skeleton className="h-24" /> : null}
            {aiEnabledConversations.map((conversation) => (
              <Link className="block rounded-2xl border p-4 hover:bg-slate-50" href={`/whatsapp/conversations/${conversation.id}`} key={conversation.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{conversation.contact?.displayName ?? conversation.subject}</p>
                  <Badge>{conversation.runtimeState.state}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{conversation.lastMessagePreview || "No reply generated yet"}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Active workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {automationsQuery.isLoading ? <Skeleton className="h-24" /> : null}
            {enabledAutomations.map((automation) => (
              <div className="rounded-2xl border p-4" key={automation.id}>
                <p className="font-medium">{automation.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{automation.trigger} {automation.keyword ? `· ${automation.keyword}` : ""}</p>
                <p className="mt-3 text-sm leading-6">{automation.responseBody}</p>
              </div>
            ))}
            <Button asChild variant="outline">
              <Link href="/whatsapp/automation">Manage workflows</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, loading }: Readonly<{ label: string; value: number; loading: boolean }>) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="mt-3 h-8 w-16" /> : <p className="mt-2 text-3xl font-semibold">{value}</p>}
      </CardContent>
    </Card>
  );
}
