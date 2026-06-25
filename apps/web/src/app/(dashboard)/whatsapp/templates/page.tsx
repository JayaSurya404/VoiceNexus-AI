"use client";

import { whatsappTemplateCategories, whatsappTemplateStatuses, type WhatsappTemplateCategory, type WhatsappTemplateStatus } from "@voicenexus/contracts";

import { WhatsappEmptyState } from "@/components/whatsapp/whatsapp-empty-state";
import { WhatsappStatusBadge } from "@/components/whatsapp/whatsapp-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCreateWhatsappTemplate, useWhatsappTemplates } from "@/hooks/use-whatsapp";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function WhatsappTemplatesPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const templatesQuery = useWhatsappTemplates(activeOrganizationId);
  const createTemplate = useCreateWhatsappTemplate();

  if (!activeOrganizationId) {
    return <WhatsappEmptyState title="No organization selected" description="Select an organization before managing message templates." />;
  }

  const organizationId = activeOrganizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    createTemplate.mutate({
      organizationId,
      name: formString(formData, "name"),
      category: formString(formData, "category", "UTILITY") as WhatsappTemplateCategory,
      language: formString(formData, "language", "en"),
      body: formString(formData, "body"),
      variables: formString(formData, "variables")
        .split(",")
        .map((variable) => variable.trim())
        .filter(Boolean),
      status: formString(formData, "status", "DRAFT") as WhatsappTemplateStatus,
    });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Message Templates</h1>
        <p className="mt-2 text-muted-foreground">Create reusable WhatsApp templates for broadcasts and agent replies.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create template</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <Field label="Name" name="name" required />
            <Field defaultValue="en" label="Language" name="language" required />
            <Select label="Category" name="category" options={whatsappTemplateCategories} />
            <Select label="Status" name="status" options={whatsappTemplateStatuses} />
            <Field label="Variables" name="variables" placeholder="first_name, appointment_time" />
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" name="body" required />
            </div>
            <Button className="md:col-span-2" disabled={createTemplate.isPending} type="submit">
              Save template
            </Button>
          </form>
        </CardContent>
      </Card>
      <section className="grid gap-4 lg:grid-cols-2">
        {templatesQuery.isLoading ? <Skeleton className="h-32" /> : null}
        {(templatesQuery.data ?? []).map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <WhatsappStatusBadge status={template.status} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{template.body}</p>
              <p className="mt-3 text-xs text-muted-foreground">{template.category} · {template.language}</p>
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

function Select({ label, name, options }: Readonly<{ label: string; name: string; options: readonly string[] }>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id={name} name={name}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
