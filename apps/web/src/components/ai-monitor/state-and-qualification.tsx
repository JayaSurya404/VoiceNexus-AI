import type { ConversationStateDto, LeadQualificationDto } from "@/lib/api/ai-brain-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StateAndQualification({
  qualification,
  state,
}: Readonly<{
  qualification: LeadQualificationDto | undefined;
  state: ConversationStateDto | null | undefined;
}>) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Conversation state</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state ? (
            <>
              <div className="flex items-center justify-between">
                <Badge>{state.state}</Badge>
                <span className="text-sm text-muted-foreground">{Math.round(state.confidence * 100)}% confidence</span>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{state.transitionReason}</p>
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <Signal label="Intent" value={state.detectedIntent} />
                <Signal label="Sentiment" value={state.sentiment} />
                <Signal label="Language" value={state.detectedLanguage ?? "Unknown"} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a session to inspect restored runtime state.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>BANT qualification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {qualification ? (
            <>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{qualification.interestLevel}</Badge>
                <span className="text-sm text-muted-foreground">
                  Score {qualification.score} · {Math.round(qualification.confidence * 100)}% confidence
                </span>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-4">
                <Signal label="Budget" value={qualification.budgetDetected ? "Yes" : "No"} />
                <Signal label="Authority" value={qualification.authorityDetected ? "Yes" : "No"} />
                <Signal label="Need" value={qualification.needDetected ? "Yes" : "No"} />
                <Signal label="Timeline" value={qualification.timelineDetected ? "Yes" : "No"} />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{qualification.qualificationReason}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No BANT qualification has been generated for this session yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Signal({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
