"use client";

import { type FormEvent, useState } from "react";
import type { CustomerPreferenceDto } from "@voicenexus/contracts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpsertPreferences } from "@/hooks/use-memory";

export function PreferenceEditor({
  organizationId,
  leadId,
  preferences,
}: Readonly<{
  organizationId: string;
  leadId: string;
  preferences: CustomerPreferenceDto | null;
}>) {
  const [language, setLanguage] = useState(preferences?.language ?? "en");
  const [timezone, setTimezone] = useState(preferences?.timezone ?? "UTC");
  const [preferredContactTime, setPreferredContactTime] = useState(
    preferences?.preferredContactTime ?? "Business hours",
  );
  const [communicationStyle, setCommunicationStyle] = useState(
    preferences?.communicationStyle ?? "Friendly and concise",
  );
  const upsertPreferences = useUpsertPreferences();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await upsertPreferences.mutateAsync({
      organizationId,
      leadId,
      language,
      timezone,
      preferredContactTime,
      communicationStyle,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preference editor</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preference-language">Language</Label>
              <Input
                id="preference-language"
                maxLength={24}
                onChange={(event) => setLanguage(event.target.value)}
                required
                value={language}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preference-timezone">Timezone</Label>
              <Input
                id="preference-timezone"
                maxLength={100}
                onChange={(event) => setTimezone(event.target.value)}
                required
                value={timezone}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferred-contact-time">Preferred contact time</Label>
            <Input
              id="preferred-contact-time"
              maxLength={120}
              onChange={(event) => setPreferredContactTime(event.target.value)}
              required
              value={preferredContactTime}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="communication-style">Communication style</Label>
            <Textarea
              id="communication-style"
              maxLength={500}
              onChange={(event) => setCommunicationStyle(event.target.value)}
              required
              rows={5}
              value={communicationStyle}
            />
          </div>
          <Button disabled={!leadId || upsertPreferences.isPending} type="submit">
            Save preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
