"use client";

import { type FormEvent, useState } from "react";
import type { LeadDto } from "@voicenexus/contracts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOutboundCall } from "@/hooks/use-calls";

export function OutboundCallForm({
  organizationId,
  leads,
}: Readonly<{
  organizationId: string;
  leads: LeadDto[];
}>) {
  const [leadId, setLeadId] = useState(leads.at(0)?.id ?? "");
  const [to, setTo] = useState(leads.at(0)?.phone ?? "");
  const [from, setFrom] = useState("");
  const [initialMessage, setInitialMessage] = useState(
    "Hello from VoiceNexus AI. Please hold while we connect your assistant.",
  );
  const createOutboundCall = useCreateOutboundCall();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createOutboundCall.mutateAsync({
      organizationId,
      leadId,
      to,
      from: from || undefined,
      record: true,
      initialMessage,
    });
  }

  function handleLeadChange(nextLeadId: string) {
    setLeadId(nextLeadId);
    const lead = leads.find((item) => item.id === nextLeadId);
    setTo(lead?.phone ?? "");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start outbound call</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="call-lead">Lead</Label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={leads.length === 0}
              id="call-lead"
              onChange={(event) => handleLeadChange(event.target.value)}
              value={leadId}
            >
              {leads.length === 0 ? <option value="">Create a lead first</option> : null}
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.fullName} {lead.phone ? `· ${lead.phone}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="call-to">To</Label>
              <Input
                id="call-to"
                onChange={(event) => setTo(event.target.value)}
                placeholder="+14155552671"
                required
                value={to}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="call-from">From override</Label>
              <Input
                id="call-from"
                onChange={(event) => setFrom(event.target.value)}
                placeholder="Uses TWILIO_PHONE_NUMBER by default"
                value={from}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="initial-message">Initial voice message</Label>
            <Textarea
              id="initial-message"
              maxLength={500}
              onChange={(event) => setInitialMessage(event.target.value)}
              required
              rows={4}
              value={initialMessage}
            />
          </div>
          <Button disabled={!leadId || createOutboundCall.isPending} type="submit">
            Create call session
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
