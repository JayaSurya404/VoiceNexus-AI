import type {
  AgentPerformanceRepository,
  HumanAgentRepository,
  HumanAgentSessionRepository,
  LeadQualificationRepository,
  QueueSessionRepository,
} from "../ports.js";
import type { CallOutcome } from "../../domain/entities/call-outcome.js";
import type { QualityScore } from "../../domain/entities/quality-score.js";
import type { SentimentAnalysis } from "../../domain/entities/sentiment-analysis.js";

export class AgentPerformanceService {
  constructor(
    private readonly agentPerformances: AgentPerformanceRepository,
    private readonly agents: HumanAgentRepository,
    private readonly humanSessions: HumanAgentSessionRepository,
    private readonly queueSessions: QueueSessionRepository,
    private readonly qualifications: LeadQualificationRepository,
  ) {}

  async refresh(
    organizationId: string,
    qualityScores: QualityScore[],
    sentiments: SentimentAnalysis[],
    outcomes: CallOutcome[],
  ) {
    const [agents, humanSessions, queueSessions, qualifications] = await Promise.all([
      this.agents.listByOrganization(organizationId),
      this.humanSessions.listByOrganization(organizationId),
      this.queueSessions.listByOrganization(organizationId),
      this.qualifications.listByOrganization(organizationId),
    ]);
    const now = new Date();

    await Promise.all(
      agents.map((agent) => {
        const handled = humanSessions.filter((session) => session.agentId === agent.id);
        const assignedQueueSessions = queueSessions.filter((session) => session.assignedAgentId === agent.id);
        const aiSessionIds = new Set(handled.map((session) => session.aiSessionId).filter((value): value is string => Boolean(value)));
        const leadIds = new Set(handled.map((session) => session.leadId).filter((value): value is string => Boolean(value)));
        const agentQuality = qualityScores.filter((score) => score.agentSessionId && aiSessionIds.has(score.agentSessionId));
        const agentSentiments = sentiments.filter((sentiment) => sentiment.agentSessionId && aiSessionIds.has(sentiment.agentSessionId));
        const agentOutcomes = outcomes.filter((outcome) => outcome.agentSessionId && aiSessionIds.has(outcome.agentSessionId));
        const agentQualifications = qualifications.filter((qualification) => leadIds.has(qualification.leadId));

        return this.agentPerformances.upsert({
          organizationId,
          agentId: agent.id,
          callsHandled: handled.length + assignedQueueSessions.length,
          averageDuration: average(
            handled.map((session) =>
              session.leftAt ? Math.max(0, session.leftAt.getTime() - session.joinedAt.getTime()) / 1000 : 0,
            ),
          ),
          averageQaScore: average(agentQuality.map((score) => score.overallScore)),
          averageSentiment: average(agentSentiments.map((sentiment) => sentiment.score)),
          transfers: assignedQueueSessions.filter((session) => session.status === "TRANSFERRED").length,
          conversions: agentOutcomes.filter((outcome) => outcome.outcome === "SALE" || outcome.outcome === "BOOKED_MEETING").length,
          leadQuality: average(agentQualifications.map((qualification) => qualification.score)),
          computedAt: now,
        });
      }),
    );

    return this.agentPerformances.listByOrganization(organizationId);
  }
}

function average(values: number[]): number {
  const filtered = values.filter((value) => Number.isFinite(value));
  return filtered.length ? filtered.reduce((total, value) => total + value, 0) / filtered.length : 0;
}
