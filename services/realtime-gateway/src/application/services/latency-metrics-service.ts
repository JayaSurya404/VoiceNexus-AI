import type {
  BargeInEventRepository,
  PlaybackSessionRepository,
  RealtimeConversationRepository,
  RealtimeRuntimeMetrics,
  TurnEventRepository,
  VoiceResponseRepository,
} from "../ports/repositories.js";

function average(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export class LatencyMetricsService {
  constructor(
    private readonly conversations: RealtimeConversationRepository,
    private readonly turns: TurnEventRepository,
    private readonly playbacks: PlaybackSessionRepository,
    private readonly bargeIns: BargeInEventRepository,
    private readonly voiceResponses: VoiceResponseRepository,
  ) {}

  async metrics(organizationId: string): Promise<RealtimeRuntimeMetrics> {
    const [conversations, turns, playbacks, bargeIns, voiceMetrics] = await Promise.all([
      this.conversations.listByOrganization(organizationId),
      this.turns.listByOrganization(organizationId, 250),
      this.playbacks.listByOrganization(organizationId, 250),
      this.bargeIns.listByOrganization(organizationId, 250),
      this.voiceResponses.metrics(organizationId),
    ]);
    const sttLatency = average(
      turns
        .filter((turn) => turn.type === "CUSTOMER_TURN_ENDED" && typeof turn.latencyMs === "number")
        .map((turn) => turn.latencyMs ?? 0),
    );
    const aiLatency = average(
      turns
        .filter((turn) => turn.type === "AI_TURN_ENDED" && typeof turn.latencyMs === "number")
        .map((turn) => turn.latencyMs ?? 0),
    );
    const playbackLatency = average(
      playbacks
        .filter((playback) => playback.completedAt && playback.startedAt)
        .map((playback) => playback.completedAt!.getTime() - playback.startedAt!.getTime()),
    );

    return {
      sttLatency,
      aiLatency,
      ttsLatency: voiceMetrics.averageLatency,
      playbackLatency,
      totalLatency: sttLatency + aiLatency + voiceMetrics.averageLatency + playbackLatency,
      activeConversations: conversations.filter((conversation) => conversation.status === "ACTIVE").length,
      bargeIns: bargeIns.length,
      takeoverActive: conversations.filter((conversation) => conversation.takeoverActive).length,
    };
  }
}
