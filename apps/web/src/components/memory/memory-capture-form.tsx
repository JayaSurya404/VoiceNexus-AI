"use client";

import { type FormEvent, useState } from "react";
import { memorySentiments, memorySources } from "@voicenexus/contracts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateConversationMemory, useUpsertCustomerMemory } from "@/hooks/use-memory";

export function MemoryCaptureForm({
  organizationId,
  leadId,
}: Readonly<{
  organizationId: string;
  leadId: string;
}>) {
  const [summary, setSummary] = useState("");
  const [relationshipScore, setRelationshipScore] = useState(50);
  const [content, setContent] = useState("");
  const [source, setSource] = useState<(typeof memorySources)[number]>("CALL");
  const [sentiment, setSentiment] = useState<(typeof memorySentiments)[number]>("NEUTRAL");
  const [importance, setImportance] = useState(3);
  const upsertMemory = useUpsertCustomerMemory();
  const createConversation = useCreateConversationMemory();

  async function handleSummarySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await upsertMemory.mutateAsync({
      organizationId,
      leadId,
      summary,
      relationshipScore,
      memoryTags: [],
    });
    setSummary("");
    setRelationshipScore(50);
  }

  async function handleConversationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createConversation.mutateAsync({
      organizationId,
      leadId,
      source,
      content,
      sentiment,
      importance,
    });
    setContent("");
    setImportance(3);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Memory card</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSummarySubmit}>
            <div className="space-y-2">
              <Label htmlFor="memory-summary">Customer summary</Label>
              <Textarea
                id="memory-summary"
                maxLength={5000}
                onChange={(event) => setSummary(event.target.value)}
                required
                rows={6}
                value={summary}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship-score">Relationship score</Label>
              <Input
                id="relationship-score"
                max={100}
                min={0}
                onChange={(event) => setRelationshipScore(Number(event.target.value))}
                type="number"
                value={relationshipScore}
              />
            </div>
            <Button disabled={!leadId || upsertMemory.isPending} type="submit">
              Save memory
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation memory</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleConversationSubmit}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="memory-source">Source</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  id="memory-source"
                  onChange={(event) => setSource(event.target.value as (typeof memorySources)[number])}
                  value={source}
                >
                  {memorySources.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory-sentiment">Sentiment</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  id="memory-sentiment"
                  onChange={(event) => setSentiment(event.target.value as (typeof memorySentiments)[number])}
                  value={sentiment}
                >
                  {memorySentiments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory-importance">Importance</Label>
                <Input
                  id="memory-importance"
                  max={5}
                  min={1}
                  onChange={(event) => setImportance(Number(event.target.value))}
                  type="number"
                  value={importance}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conversation-memory">Conversation detail</Label>
              <Textarea
                id="conversation-memory"
                maxLength={10000}
                onChange={(event) => setContent(event.target.value)}
                required
                rows={6}
                value={content}
              />
            </div>
            <Button disabled={!leadId || createConversation.isPending} type="submit">
              Add conversation memory
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
