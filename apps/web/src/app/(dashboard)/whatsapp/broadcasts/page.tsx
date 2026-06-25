"use client";

import { Megaphone } from "lucide-react";

import { WhatsappEmptyState } from "@/components/whatsapp/whatsapp-empty-state";
import { WhatsappStatusBadge } from "@/components/whatsapp/whatsapp-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateWhatsappBroadcast,
  useWhatsappBroadcasts,
  useWhatsappContacts,
  useWhatsappTemplates,
} from "@/hooks/use-whatsapp";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function WhatsappBroadcastsPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const contactsQuery = useWhatsappContacts({ organizationId: activeOrganizationId ?? "" }, Boolean(activeOrganizationId));
  const templatesQuery = useWhatsappTemplates(activeOrganizationId);
  const broadcastsQuery = useWhatsappBroadcasts(activeOrganizationId);
  const createBroadcast = useCreateWhatsappBroadcast();

  if (!activeOrganizationId) {
    return <WhatsappEmptyState title="No organization selected" description="Select an organization before sending WhatsApp broadcasts." />;
  }

  const organizationId = activeOrganizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const scheduledAt = formString(formData, "scheduledAt");
    createBroadcast.mutate({
      organizationId,
      name: formString(formData, "name"),
      templateId: formString(formData, "templateId") || null,
      messageBody: formString(formData, "messageBody"),
      contactIds: formData.getAll("contactIds").filter((value): value is string => typeof value === "string"),
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    });
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Megaphone className="h-5 w-5 text-emerald-600" /> New broadcast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Name" name="name" required />
            <div className="space-y-2">
              <Label htmlFor="templateId">Template</Label>
              <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="templateId" name="templateId">
                <option value="">No template</option>
                {(templatesQuery.data ?? []).map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="messageBody">Message</Label>
              <Textarea id="messageBody" name="messageBody" required />
            </div>
            <Field label="Schedule time" name="scheduledAt" type="datetime-local" />
            <div className="space-y-2">
              <Label>Recipients</Label>
              <div className="max-h-56 space-y-2 overflow-y-auto rounded-2xl border p-3">
                {(contactsQuery.data ?? []).map((contact) => (
                  <label className="flex items-center gap-2 text-sm" key={contact.id}>
                    <input name="contactIds" type="checkbox" value={contact.id} /> {contact.displayName} ({contact.phone})
                  </label>
                ))}
              </div>
            </div>
            <Button className="w-full" disabled={createBroadcast.isPending} type="submit">
              Create broadcast
            </Button>
          </form>
        </CardContent>
      </Card>
      <section className="space-y-4">
        {broadcastsQuery.isLoading ? <Skeleton className="h-32" /> : null}
        {(broadcastsQuery.data ?? []).map((broadcast) => (
          <Card key={broadcast.id}>
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-lg">{broadcast.name}</CardTitle>
                <WhatsappStatusBadge status={broadcast.status} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{broadcast.messageBody}</p>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                <p>Total: {broadcast.metrics.total}</p>
                <p>Queued: {broadcast.metrics.queued}</p>
                <p>Sent: {broadcast.metrics.sent}</p>
                <p>Failed: {broadcast.metrics.failed}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
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
