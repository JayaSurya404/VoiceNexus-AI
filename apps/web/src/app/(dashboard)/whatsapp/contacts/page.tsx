"use client";

import { WhatsappEmptyState } from "@/components/whatsapp/whatsapp-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCreateWhatsappContact, useWhatsappContacts } from "@/hooks/use-whatsapp";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function WhatsappContactsPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const contactsQuery = useWhatsappContacts(
    { organizationId: activeOrganizationId ?? "" },
    Boolean(activeOrganizationId),
  );
  const createContact = useCreateWhatsappContact();

  if (!activeOrganizationId) {
    return <WhatsappEmptyState title="No organization selected" description="Select an organization before adding WhatsApp contacts." />;
  }

  const organizationId = activeOrganizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    createContact.mutate({
      organizationId,
      leadId: formString(formData, "leadId") || null,
      displayName: formString(formData, "displayName"),
      phone: formString(formData, "phone"),
      email: formString(formData, "email"),
      tags: formString(formData, "tags")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      notes: formString(formData, "notes"),
    });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">WhatsApp Contacts</h1>
        <p className="mt-2 text-muted-foreground">Manage WhatsApp-ready contacts and optional CRM lead links.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create contact</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <Field label="Display name" name="displayName" required />
            <Field label="Phone" name="phone" placeholder="+14155552671" required />
            <Field label="Email" name="email" type="email" />
            <Field label="CRM lead id" name="leadId" />
            <Field label="Tags" name="tags" placeholder="vip, renewal" />
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" />
            </div>
            <Button className="md:col-span-2" disabled={createContact.isPending} type="submit">
              Create contact
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">All contacts</CardTitle>
        </CardHeader>
        <CardContent>
          {contactsQuery.isLoading ? <Skeleton className="h-32" /> : null}
          {contactsQuery.isError ? <ErrorPanel message="Could not load contacts." /> : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(contactsQuery.data ?? []).map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.displayName}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.email ?? "-"}</TableCell>
                  <TableCell>{contact.leadId ?? "-"}</TableCell>
                  <TableCell>{contact.tags.join(", ") || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
