"use client";

import type { TagDto } from "@voicenexus/contracts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTag } from "@/hooks/use-crm";
import { formString } from "@/lib/form";

export function TagManager({ organizationId, tags }: Readonly<{ organizationId: string; tags: TagDto[] }>) {
  const createTag = useCreateTag();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    createTag.mutate({
      organizationId,
      name: formString(formData, "name"),
      color: formString(formData, "color", "#0ea5e9"),
    });
    event.currentTarget.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tag management</CardTitle>
        <CardDescription>Create organization-level tags for segmentation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="grid gap-3 sm:grid-cols-[1fr_120px_auto]" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="tag-name">Name</Label>
            <Input id="tag-name" name="name" placeholder="High intent" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag-color">Color</Label>
            <Input defaultValue="#0ea5e9" id="tag-color" name="color" type="color" />
          </div>
          <Button className="self-end" disabled={createTag.isPending} type="submit">
            Add tag
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              className="rounded-full border px-3 py-1 text-sm"
              key={tag.id}
              style={{ borderColor: tag.color, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
