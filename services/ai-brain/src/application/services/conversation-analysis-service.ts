export interface ConversationAnalysisInput {
  transcript: string;
  agentUtterances?: number;
  customerUtterances?: number;
  sentimentScores?: number[];
  confidenceScores?: number[];
}

export interface ConversationAnalysis {
  talkListenRatio: number;
  silencePeriods: number;
  interruptionCount: number;
  sentimentChanges: number;
  confidenceChanges: number;
  topicShifts: number;
}

export class ConversationAnalysisService {
  analyze(input: ConversationAnalysisInput): ConversationAnalysis {
    const transcript = input.transcript.toLowerCase();
    const words = transcript.split(/\s+/).filter(Boolean);
    const agentUtterances = input.agentUtterances ?? this.countMatches(transcript, "agent:");
    const customerUtterances = input.customerUtterances ?? this.countMatches(transcript, "customer:");
    const silencePeriods = this.countMatches(transcript, "[silence]") + this.countMatches(transcript, "(silence)");
    const interruptionCount = this.countMatches(transcript, "interrupt");
    const sentimentChanges = this.countDirectionChanges(input.sentimentScores ?? []);
    const confidenceChanges = this.countDirectionChanges(input.confidenceScores ?? []);

    return {
      talkListenRatio: customerUtterances > 0 ? Number((agentUtterances / customerUtterances).toFixed(2)) : agentUtterances,
      silencePeriods,
      interruptionCount,
      sentimentChanges,
      confidenceChanges,
      topicShifts: Math.max(0, Math.floor(words.length / 120) - 1)
    };
  }

  private countMatches(value: string, token: string): number {
    return value.split(token).length - 1;
  }

  private countDirectionChanges(values: number[]): number {
    if (values.length < 3) {
      return 0;
    }

    let changes = 0;
    let previousDirection = 0;

    for (let index = 1; index < values.length; index += 1) {
      const current = values[index];
      const previous = values[index - 1];

      if (current === undefined || previous === undefined) {
        continue;
      }

      const direction = Math.sign(current - previous);

      if (direction !== 0 && previousDirection !== 0 && direction !== previousDirection) {
        changes += 1;
      }

      if (direction !== 0) {
        previousDirection = direction;
      }
    }

    return changes;
  }
}
