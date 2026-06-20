"use client";

import { customerTypes, type CustomerType } from "@voicenexus/contracts";

import { CrmEmptyState } from "@/components/crm/crm-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useContacts, useCreateContact } from "@/hooks/use-crm";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function ContactsPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const contactsQuery = useContacts(
    { organizationId: activeOrganizationId ?? "" },
    Boolean(activeOrganizationId),
  );
  const createContact = useCreateContact();

  if (!activeOrganizationId) {
    return (
      <CrmEmptyState
        description="Select an organization before adding contacts."
        title="No organization selected"
      />
    );
  }

  const organizationId = activeOrganizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    createContact.mutate({
      organizationId,
      leadId: formString(formData, "leadId"),
      email: formString(formData, "email"),
      phone: formString(formData, "phone"),
      preferredLanguage: formString(formData, "preferredLanguage", "en"),
      timezone: formString(formData, "timezone", "UTC"),
      customerType: formString(formData, "customerType", "LEAD") as CustomerType,
    });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Contacts</h1>
        <p className="mt-2 text-muted-foreground">Contact records converted from organization leads.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create contact</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
            <Field label="Lead id" name="leadId" required />
            <Field label="Email" name="email" type="email" />
            <Field label="Phone" name="phone" />
            <Field defaultValue="en" label="Preferred language" name="preferredLanguage" />
            <Field defaultValue="UTC" label="Timezone" name="timezone" />
            <div className="space-y-2">
              <Label htmlFor="customerType">Customer type</Label>
              <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="customerType" name="customerType">
                {customerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <Button className="md:col-span-3" disabled={createContact.isPending} type="submit">
              Create contact
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead id</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Timezone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(contactsQuery.data ?? []).map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.leadId}</TableCell>
                  <TableCell>{contact.email ?? "—"}</TableCell>
                  <TableCell>{contact.phone ?? "—"}</TableCell>
                  <TableCell>{contact.customerType}</TableCell>
                  <TableCell>{contact.timezone}</TableCell>
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
