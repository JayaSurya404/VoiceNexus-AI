"use client";

import { type FormEvent, useState } from "react";
import type { CallSessionDto } from "@voicenexus/contracts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTransferCall } from "@/hooks/use-calls";

export function TransferCallForm({ call }: Readonly<{ call: CallSessionDto }>) {
  const [toPhoneNumber, setToPhoneNumber] = useState("");
  const [reason, setReason] = useState("Human handoff requested");
  const transferCall = useTransferCall();
  const canTransfer = Boolean(call.providerCallSid && !["COMPLETED", "FAILED", "BUSY", "NO_ANSWER", "CANCELED"].includes(call.status));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await transferCall.mutateAsync({
      organizationId: call.organizationId,
      callSessionId: call.id,
      toPhoneNumber,
      reason,
    });
    setToPhoneNumber("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Human handoff</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="transfer-number">Transfer to</Label>
            <Input
              disabled={!canTransfer}
              id="transfer-number"
              onChange={(event) => setToPhoneNumber(event.target.value)}
              placeholder="+14155552671"
              required
              value={toPhoneNumber}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-reason">Reason</Label>
            <Textarea
              disabled={!canTransfer}
              id="transfer-reason"
              maxLength={500}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              value={reason}
            />
          </div>
          <Button disabled={!canTransfer || transferCall.isPending} type="submit">
            Transfer call
          </Button>
          {!canTransfer ? (
            <p className="text-xs text-muted-foreground">Only connected, active provider calls can be transferred.</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
