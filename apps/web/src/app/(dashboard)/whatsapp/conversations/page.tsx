"use client";

import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";

import { WhatsappEmptyState } from "@/components/whatsapp/whatsapp-empty-state";
import { WhatsappStatusBadge } from "@/components/whatsapp/whatsapp-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateWhatsappConversation, useWhatsappContacts, useWhatsappConversations } from "@/hooks/use-whatsapp";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function WhatsappConversationsPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const conversationsQuery = useWhatsappConversations(
    { organizationId: activeOrganizationId ?? "" },
    Boolean(activeOrganizationId),
  );
  const contactsQuery = useWhatsappContacts(
    { organizationId: activeOrganizationId ?? "" },
    Boolean(activeOrganizationId),
  );
  const createConversation = useCreateWhatsappConversation();

  if (!activeOrganizationId) {
    return <WhatsappEmptyState title="No organization selected" description="Select an organization before opening the WhatsApp inbox." />;
  }

  const organizationId = activeOrganizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    createConversation.mutate({
      organizationId,
      contactId: formString(formData, "contactId"),
      subject: formString(formData, "subject", "WhatsApp conversation"),
    });
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Start conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="contactId">Contact</Label>
              <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="contactId" name="contactId" required>
                <option value="">Select contact</option>
                {(contactsQuery.data ?? []).map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.displayName} ({contact.phone})
                  </option>
                ))}
              </select>
            </div>
            <Field label="Subject" name="subject" placeholder="Renewal follow-up" />
            <Button className="w-full" disabled={createConversation.isPending} type="submit">
              <Plus className="h-4 w-4" /> Start
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageCircle className="h-5 w-5 text-emerald-600" /> Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {conversationsQuery.isLoading ? <Skeleton className="h-32" /> : null}
          {conversationsQuery.isError ? <ErrorPanel message="Could not load conversations." /> : null}
          {(conversationsQuery.data ?? []).map((conversation) => (
            <Link
              className="grid gap-3 rounded-2xl border p-4 transition hover:bg-slate-50 md:grid-cols-[1fr_auto]"
              href={`/whatsapp/conversations/${conversation.id}`}
              key={conversation.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{conversation.contact?.displayName ?? conversation.subject}</p>
                  <WhatsappStatusBadge status={conversation.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{conversation.lastMessagePreview || conversation.subject}</p>
                <p className="mt-2 text-xs text-muted-foreground">Runtime: {conversation.runtimeState.state}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{conversation.unreadCount} unread</p>
                <p>{conversation.contact?.phone}</p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}

function ErrorPanel({ message }: Readonly<{ message: string }>) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>;
}
