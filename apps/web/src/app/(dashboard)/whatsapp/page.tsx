"use client";

import Link from "next/link";
import { ArrowRight, Bot, FileText, Megaphone, MessageCircle, UsersRound, Workflow } from "lucide-react";

import { WhatsappEmptyState } from "@/components/whatsapp/whatsapp-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWhatsappDashboard, useWhatsappConversations } from "@/hooks/use-whatsapp";
import { useAuthStore } from "@/store/auth-store";

const links = [
  { label: "Conversations", href: "/whatsapp/conversations", icon: MessageCircle },
  { label: "Contacts", href: "/whatsapp/contacts", icon: UsersRound },
  { label: "Broadcasts", href: "/whatsapp/broadcasts", icon: Megaphone },
  { label: "Templates", href: "/whatsapp/templates", icon: FileText },
  { label: "AI Replies", href: "/whatsapp/ai-replies", icon: Bot },
  { label: "Automation", href: "/whatsapp/automation", icon: Workflow },
];

export default function WhatsappDashboardPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const dashboardQuery = useWhatsappDashboard(activeOrganizationId);
  const conversationsQuery = useWhatsappConversations(
    { organizationId: activeOrganizationId ?? "" },
    Boolean(activeOrganizationId),
  );

  if (!activeOrganizationId) {
    return (
      <WhatsappEmptyState
        title="No organization selected"
        description="Select an organization before managing WhatsApp conversations."
      />
    );
  }

  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 rounded-3xl bg-slate-950 p-8 text-white lg:flex-row lg:items-end">
        <div>
          <p className="text-sm text-emerald-300">WhatsApp Platform</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Messaging command center</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Manage WhatsApp conversations, contacts, templates, broadcasts, AI replies, automation, CRM links, and customer memory.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/whatsapp/conversations">Open inbox</Link>
        </Button>
      </section>

      {dashboardQuery.isError ? (
        <ErrorPanel message="Could not load WhatsApp dashboard." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Metric label="Contacts" loading={dashboardQuery.isLoading} value={dashboard?.totalContacts} />
          <Metric label="Open chats" loading={dashboardQuery.isLoading} value={dashboard?.openConversations} />
          <Metric label="Unread" loading={dashboardQuery.isLoading} value={dashboard?.unreadMessages} />
          <Metric label="AI enabled" loading={dashboardQuery.isLoading} value={dashboard?.aiRepliesEnabled} />
          <Metric label="Broadcasts sent" loading={dashboardQuery.isLoading} value={dashboard?.broadcastsSent} />
          <Metric label="Approved templates" loading={dashboardQuery.isLoading} value={dashboard?.templatesApproved} />
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {links.map((item) => (
          <Card key={item.href}>
            <CardHeader>
              <item.icon className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href={item.href}>
                  Open <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {conversationsQuery.isLoading ? <Skeleton className="h-24" /> : null}
          {conversationsQuery.isError ? <ErrorPanel message="Could not load conversations." /> : null}
          {(conversationsQuery.data ?? []).slice(0, 6).map((conversation) => (
            <Link
              className="flex items-center justify-between rounded-2xl border p-4 transition hover:bg-slate-50"
              href={`/whatsapp/conversations/${conversation.id}`}
              key={conversation.id}
            >
              <div>
                <p className="font-medium">{conversation.contact?.displayName ?? conversation.subject}</p>
                <p className="mt-1 text-sm text-muted-foreground">{conversation.lastMessagePreview || "No messages yet"}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value, loading }: Readonly<{ label: string; value?: number; loading: boolean }>) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? <Skeleton className="mt-3 h-8 w-16" /> : <p className="mt-2 text-3xl font-semibold">{value ?? 0}</p>}
      </CardContent>
    </Card>
  );
}

function ErrorPanel({ message }: Readonly<{ message: string }>) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>;
}
