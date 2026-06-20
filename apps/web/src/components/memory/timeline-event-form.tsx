"use client";

import { type FormEvent, useState } from "react";
import { timelineEventTypes } from "@voicenexus/contracts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTimelineEvent } from "@/hooks/use-memory";

export function TimelineEventForm({
  organizationId,
  leadId,
}: Readonly<{
  organizationId: string;
  leadId: string;
}>) {
  const [eventType, setEventType] = useState<(typeof timelineEventTypes)[number]>("CALL_COMPLETED");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createTimelineEvent = useCreateTimelineEvent();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createTimelineEvent.mutateAsync({
      organizationId,
      leadId,
      eventType,
      title,
      description,
      metadata: {},
    });
    setTitle("");
    setDescription("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add timeline event</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="timeline-event-type">Event type</Label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              id="timeline-event-type"
              onChange={(event) => setEventType(event.target.value as (typeof timelineEventTypes)[number])}
              value={eventType}
            >
              {timelineEventTypes.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline-title">Title</Label>
            <Input
              id="timeline-title"
              maxLength={160}
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline-description">Description</Label>
            <Textarea
              id="timeline-description"
              maxLength={3000}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              value={description}
            />
          </div>
          <Button disabled={!leadId || createTimelineEvent.isPending} type="submit">
            Save event
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
