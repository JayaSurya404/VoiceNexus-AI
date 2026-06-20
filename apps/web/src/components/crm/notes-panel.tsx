"use client";

import type { NoteDto } from "@voicenexus/contracts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateNote } from "@/hooks/use-crm";
import { formString } from "@/lib/form";

export function NotesPanel({
  organizationId,
  leadId,
  notes,
}: Readonly<{
  organizationId: string;
  leadId: string;
  notes: NoteDto[];
}>) {
  const createNote = useCreateNote();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    createNote.mutate({
      organizationId,
      leadId,
      content: formString(formData, "content"),
    });
    event.currentTarget.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Label htmlFor="note-content">New note</Label>
          <Textarea id="note-content" name="content" required />
          <Button disabled={createNote.isPending} type="submit">
            Add note
          </Button>
        </form>
        <div className="space-y-3">
          {notes.map((note) => (
            <div className="rounded-2xl bg-slate-50 p-3" key={note.id}>
              <p className="text-sm">{note.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {notes.length === 0 ? <p className="text-sm text-muted-foreground">No notes yet.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}
