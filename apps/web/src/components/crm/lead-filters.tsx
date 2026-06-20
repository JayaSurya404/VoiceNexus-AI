"use client";

import { leadStatuses } from "@voicenexus/contracts";

import type { TagDto } from "@voicenexus/contracts";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrmStore } from "@/store/crm-store";

export function LeadFilters({ tags }: Readonly<{ tags: TagDto[] }>) {
  const leadSearch = useCrmStore((state) => state.leadSearch);
  const leadStatus = useCrmStore((state) => state.leadStatus);
  const tagFilter = useCrmStore((state) => state.tagFilter);
  const setLeadSearch = useCrmStore((state) => state.setLeadSearch);
  const setLeadStatus = useCrmStore((state) => state.setLeadStatus);
  const setTagFilter = useCrmStore((state) => state.setTagFilter);

  return (
    <Card>
      <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_220px_220px]">
        <div className="space-y-2">
          <Label htmlFor="lead-search">Search</Label>
          <Input
            id="lead-search"
            onChange={(event) => setLeadSearch(event.target.value)}
            placeholder="Search by name, email, phone, or company"
            value={leadSearch}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead-status">Status</Label>
          <select
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            id="lead-status"
            onChange={(event) => setLeadStatus(event.target.value as typeof leadStatus)}
            value={leadStatus}
          >
            <option value="">All statuses</option>
            {leadStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead-tag">Tag</Label>
          <select
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            id="lead-tag"
            onChange={(event) => setTagFilter(event.target.value)}
            value={tagFilter}
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
