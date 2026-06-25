"use client";

import { whatsappAutomationTriggers, type WhatsappAutomationTrigger } from "@voicenexus/contracts";

import { WhatsappEmptyState } from "@/components/whatsapp/whatsapp-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCreateWhatsappAutomation, useWhatsappAutomations } from "@/hooks/use-whatsapp";
import { formString } from "@/lib/form";
import { useAuthStore } from "@/store/auth-store";

export default function WhatsappAutomationPage() {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const automationsQuery = useWhatsappAutomations(activeOrganizationId);
  const createAutomation = useCreateWhatsappAutomation();

  if (!activeOrganizationId) {
    return <WhatsappEmptyState title="No organization selected" description="Select an organization before configuring WhatsApp automation." />;
  }

  const organizationId = activeOrganizationId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    createAutomation.mutate({
      organizationId,
      name: formString(formData, "name"),
      trigger: formString(formData, "trigger", "FIRST_MESSAGE") as WhatsappAutomationTrigger,
      keyword: formString(formData, "keyword"),
      responseBody: formString(formData, "responseBody"),
      isEnabled: formData.get("isEnabled") === "on",
    });
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Name" name="name" required />
            <div className="space-y-2">
              <Label htmlFor="trigger">Trigger</Label>
              <select className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm" id="trigger" name="trigger">
                {whatsappAutomationTriggers.map((trigger) => (
                  <option key={trigger} value={trigger}>{trigger}</option>
                ))}
              </select>
            </div>
            <Field label="Keyword" name="keyword" placeholder="pricing" />
            <div className="space-y-2">
              <Label htmlFor="responseBody">Response</Label>
              <Textarea id="responseBody" name="responseBody" required />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input defaultChecked name="isEnabled" type="checkbox" /> Enabled
            </label>
            <Button className="w-full" disabled={createAutomation.isPending} type="submit">
              Save workflow
            </Button>
          </form>
        </CardContent>
      </Card>
      <section className="space-y-4">
        {automationsQuery.isLoading ? <Skeleton className="h-32" /> : null}
        {(automationsQuery.data ?? []).map((automation) => (
          <Card key={automation.id}>
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <CardTitle className="text-lg">{automation.name}</CardTitle>
                <Badge variant={automation.isEnabled ? "default" : "outline"}>
                  {automation.isEnabled ? "Enabled" : "Paused"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{automation.trigger} {automation.keyword ? `· ${automation.keyword}` : ""}</p>
              <p className="mt-3 text-sm leading-6">{automation.responseBody}</p>
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
