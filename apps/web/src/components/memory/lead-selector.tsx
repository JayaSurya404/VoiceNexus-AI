"use client";

import type { LeadDto } from "@voicenexus/contracts";

import { Label } from "@/components/ui/label";

export function LeadSelector({
  leads,
  selectedLeadId,
  onChange,
}: Readonly<{
  leads: LeadDto[];
  selectedLeadId: string;
  onChange: (leadId: string) => void;
}>) {
  return (
    <div className="space-y-2">
      <Label htmlFor="memory-lead">Customer lead</Label>
      <select
        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        disabled={leads.length === 0}
        id="memory-lead"
        onChange={(event) => onChange(event.target.value)}
        value={selectedLeadId}
      >
        {leads.length === 0 ? <option value="">Create a CRM lead first</option> : null}
        {leads.map((lead) => (
          <option key={lead.id} value={lead.id}>
            {lead.fullName} {lead.company ? `· ${lead.company}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
