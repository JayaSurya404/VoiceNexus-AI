"use client";

import { activityTypes, type ActivityType } from "@voicenexus/contracts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateActivity } from "@/hooks/use-crm";
import { formString } from "@/lib/form";

export function ActivityForm({
  organizationId,
  leadId,
}: Readonly<{
  organizationId: string;
  leadId: string;
}>) {
  const createActivity = useCreateActivity();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    createActivity.mutate({
      organizationId,
      leadId,
      type: formString(formData, "type", "TASK") as ActivityType,
      title: formString(formData, "title"),
      description: formString(formData, "description"),
    });
    event.currentTarget.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add activity</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="activity-type">Type</Label>
            <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="activity-type" name="type">
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-title">Title</Label>
            <Input id="activity-title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-description">Description</Label>
            <Textarea id="activity-description" name="description" />
          </div>
          <Button disabled={createActivity.isPending} type="submit">
            Add activity
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
