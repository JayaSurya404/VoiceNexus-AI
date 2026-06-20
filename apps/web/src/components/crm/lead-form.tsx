"use client";

import { useState } from "react";
import { leadStatuses, type LeadDto, type LeadStatus, type TagDto } from "@voicenexus/contracts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLead, useUpdateLead } from "@/hooks/use-crm";
import { formString } from "@/lib/form";

interface LeadFormProps {
  organizationId: string;
  tags: TagDto[];
  lead?: LeadDto;
}

export function LeadForm({ organizationId, tags, lead }: Readonly<LeadFormProps>) {
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const [selectedTags, setSelectedTags] = useState<string[]>(lead?.tags.map((tag) => tag.id) ?? []);

  const isEditing = Boolean(lead);
  const isPending = createLead.isPending || updateLead.isPending;

  function toggleTag(tagId: string) {
    setSelectedTags((current) =>
      current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      organizationId,
      firstName: formString(formData, "firstName"),
      lastName: formString(formData, "lastName"),
      email: formString(formData, "email"),
      phone: formString(formData, "phone"),
      company: formString(formData, "company"),
      source: formString(formData, "source", "Manual"),
      status: formString(formData, "status", "NEW") as LeadStatus,
      score: Number(formString(formData, "score", "0")),
      language: formString(formData, "language", "en"),
      assignedTo: formString(formData, "assignedTo") || null,
      tags: selectedTags,
    };

    if (lead) {
      updateLead.mutate({ id: lead.id, input: payload });
      return;
    }

    createLead.mutate(payload);
    event.currentTarget.reset();
    setSelectedTags([]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Lead assignment and details" : "Create lead"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update status, score, assignee, and tags for this organization-scoped lead."
            : "Add a new CRM lead to the active organization."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field defaultValue={lead?.firstName} label="First name" name="firstName" required />
          <Field defaultValue={lead?.lastName} label="Last name" name="lastName" required />
          <Field defaultValue={lead?.email ?? ""} label="Email" name="email" type="email" />
          <Field defaultValue={lead?.phone ?? ""} label="Phone" name="phone" />
          <Field defaultValue={lead?.company} label="Company" name="company" />
          <Field defaultValue={lead?.source ?? "Manual"} label="Source" name="source" />
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              defaultValue={lead?.status ?? "NEW"}
              id="status"
              name="status"
            >
              {leadStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <Field defaultValue={lead?.score ?? 0} label="Score" max={100} min={0} name="score" type="number" />
          <Field defaultValue={lead?.language ?? "en"} label="Language" name="language" />
          <Field defaultValue={lead?.assignedTo ?? ""} label="Assigned user id" name="assignedTo" />
          <div className="space-y-2 md:col-span-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  className="rounded-full border px-3 py-1 text-sm"
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    borderColor: tag.color,
                    backgroundColor: selectedTags.includes(tag.id) ? `${tag.color}22` : "transparent",
                    color: tag.color,
                  }}
                  type="button"
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 ? <span className="text-sm text-muted-foreground">Create tags first.</span> : null}
            </div>
          </div>
          <Button className="md:col-span-2" disabled={isPending} type="submit">
            {isPending ? "Saving..." : isEditing ? "Save lead" : "Create lead"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

function Field({ label, name, ...props }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}
