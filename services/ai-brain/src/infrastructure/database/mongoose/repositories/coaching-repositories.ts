import type { AgentCoachingInsight } from "../../../../domain/entities/agent-coaching-insight.js";
import type { AgentCoachingSession } from "../../../../domain/entities/agent-coaching-session.js";
import type { AgentRecommendation } from "../../../../domain/entities/agent-recommendation.js";
import type { ComplianceAlert } from "../../../../domain/entities/compliance-alert.js";
import type { ConversationScorecard } from "../../../../domain/entities/conversation-scorecard.js";
import type { NextBestAction } from "../../../../domain/entities/next-best-action.js";
import type {
  AgentCoachingInsightRepository,
  AgentCoachingSessionRepository,
  AgentRecommendationRepository,
  ComplianceAlertRepository,
  ConversationScorecardRepository,
  NextBestActionRepository
} from "../../../../application/coaching-ports.js";
import { AgentCoachingInsightModel } from "../models/agent-coaching-insight-model.js";
import { AgentCoachingSessionModel } from "../models/agent-coaching-session-model.js";
import { AgentRecommendationModel } from "../models/agent-recommendation-model.js";
import { ComplianceAlertModel } from "../models/compliance-alert-model.js";
import { ConversationScorecardModel } from "../models/conversation-scorecard-model.js";
import { NextBestActionModel } from "../models/next-best-action-model.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

const sortNewest = { createdAt: -1 } as const;
type AnyDoc = Record<string, unknown>;
const id = (value: unknown): string => String(value);
const maybeId = (value: unknown): string | undefined => (value ? id(value) : undefined);

const toDate = (value: unknown): Date => (value instanceof Date ? value : new Date(String(value)));

const toAgentCoachingSession = (doc: AnyDoc): AgentCoachingSession => {
  const session: AgentCoachingSession = {
    id: id(doc._id),
    organizationId: id(doc.organizationId),
    agentId: maybeId(doc.agentId) ?? null,
    humanSessionId: maybeId(doc.humanSessionId) ?? null,
    aiSessionId: maybeId(doc.aiSessionId) ?? null,
    callId: maybeId(doc.callId) ?? null,
    conversationId: maybeId(doc.conversationId) ?? null,
    status: doc.status as AgentCoachingSession["status"],
    startedAt: toDate(doc.startedAt),
    endedAt: doc.endedAt ? toDate(doc.endedAt) : null,
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt)
  };

  return session;
};

const toAgentCoachingInsight = (doc: AnyDoc): AgentCoachingInsight => {
  const insight: AgentCoachingInsight = {
    id: id(doc._id),
    organizationId: id(doc.organizationId),
    coachingSessionId: maybeId(doc.coachingSessionId) ?? null,
    agentId: maybeId(doc.agentId) ?? null,
    conversationId: maybeId(doc.conversationId) ?? null,
    type: doc.type as AgentCoachingInsight["type"],
    message: String(doc.message ?? ""),
    reasoning: String(doc.reasoning ?? ""),
    confidence: Number(doc.confidence ?? 0),
    accepted: typeof doc.accepted === "boolean" ? doc.accepted : null,
    createdAt: toDate(doc.createdAt)
  };

  return insight;
};

const toAgentRecommendation = (doc: AnyDoc): AgentRecommendation => {
  const recommendation: AgentRecommendation = {
    id: id(doc._id),
    organizationId: id(doc.organizationId),
    coachingSessionId: maybeId(doc.coachingSessionId) ?? null,
    agentId: maybeId(doc.agentId) ?? null,
    conversationId: maybeId(doc.conversationId) ?? null,
    type: doc.type as AgentRecommendation["type"],
    title: String(doc.title ?? ""),
    description: String(doc.description ?? ""),
    priority: doc.priority as AgentRecommendation["priority"],
    used: Boolean(doc.used),
    confidence: Number(doc.confidence ?? 0),
    createdAt: toDate(doc.createdAt)
  };

  return recommendation;
};

const toComplianceAlert = (doc: AnyDoc): ComplianceAlert => {
  const alert: ComplianceAlert = {
    id: id(doc._id),
    organizationId: id(doc.organizationId),
    coachingSessionId: maybeId(doc.coachingSessionId) ?? null,
    agentId: maybeId(doc.agentId) ?? null,
    conversationId: maybeId(doc.conversationId) ?? null,
    type: doc.type as ComplianceAlert["type"],
    severity: doc.severity as ComplianceAlert["severity"],
    message: String(doc.message ?? ""),
    resolved: Boolean(doc.resolved),
    createdAt: toDate(doc.createdAt)
  };

  return alert;
};

const toConversationScorecard = (doc: AnyDoc): ConversationScorecard => {
  const scorecard: ConversationScorecard = {
    id: id(doc._id),
    organizationId: id(doc.organizationId),
    coachingSessionId: maybeId(doc.coachingSessionId) ?? null,
    agentId: maybeId(doc.agentId) ?? null,
    conversationId: maybeId(doc.conversationId) ?? null,
    discoveryQuality: Number(doc.discoveryQuality ?? 0),
    qualificationQuality: Number(doc.qualificationQuality ?? 0),
    objectionHandlingQuality: Number(doc.objectionHandlingQuality ?? 0),
    complianceScore: Number(doc.complianceScore ?? 0),
    closingEffectiveness: Number(doc.closingEffectiveness ?? 0),
    overallScore: Number(doc.overallScore ?? 0),
    reasoning: String(doc.reasoning ?? ""),
    createdAt: toDate(doc.createdAt),
    updatedAt: toDate(doc.updatedAt)
  };

  return scorecard;
};

const toNextBestAction = (doc: AnyDoc): NextBestAction => {
  const action: NextBestAction = {
    id: id(doc._id),
    organizationId: id(doc.organizationId),
    coachingSessionId: maybeId(doc.coachingSessionId) ?? null,
    agentId: maybeId(doc.agentId) ?? null,
    conversationId: maybeId(doc.conversationId) ?? null,
    actionType: doc.actionType as NextBestAction["actionType"],
    label: String(doc.label ?? ""),
    rationale: String(doc.rationale ?? ""),
    priority: doc.priority as NextBestAction["priority"],
    completed: Boolean(doc.completed),
    confidence: Number(doc.confidence ?? 0),
    createdAt: toDate(doc.createdAt)
  };

  return action;
};

export class MongoAgentCoachingSessionRepository implements AgentCoachingSessionRepository {
  async create(session: AgentCoachingSession): Promise<AgentCoachingSession> {
    const created = await AgentCoachingSessionModel.create({
      ...session,
      _id: objectId(session.id),
      organizationId: objectIdOrThrow(session.organizationId),
      agentId: objectId(session.agentId),
      humanSessionId: objectId(session.humanSessionId),
      aiSessionId: objectId(session.aiSessionId),
      callId: objectId(session.callId),
      conversationId: objectId(session.conversationId)
    });

    return toAgentCoachingSession(created.toObject() as AnyDoc);
  }

  async findById(organizationId: string, id: string): Promise<AgentCoachingSession | null> {
    const session = await AgentCoachingSessionModel.findOne({
      _id: objectIdOrThrow(id),
      organizationId: objectIdOrThrow(organizationId)
    }).lean();

    return session ? toAgentCoachingSession(session as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<AgentCoachingSession[]> {
    const sessions = await AgentCoachingSessionModel.find({
      organizationId: objectIdOrThrow(organizationId)
    })
      .sort(sortNewest)
      .limit(200)
      .lean();

    return sessions.map((session: unknown) => toAgentCoachingSession(session as AnyDoc));
  }

  async update(
    organizationId: string,
    id: string,
    patch: Partial<Pick<AgentCoachingSession, "status" | "endedAt">>
  ): Promise<AgentCoachingSession | null> {
    const session = await AgentCoachingSessionModel.findOneAndUpdate(
      {
        _id: objectIdOrThrow(id),
        organizationId: objectIdOrThrow(organizationId)
      },
      { $set: patch },
      { new: true }
    ).lean();

    return session ? toAgentCoachingSession(session as AnyDoc) : null;
  }
}

export class MongoAgentCoachingInsightRepository implements AgentCoachingInsightRepository {
  async create(insight: AgentCoachingInsight): Promise<AgentCoachingInsight> {
    const created = await AgentCoachingInsightModel.create({
      ...insight,
      _id: objectId(insight.id),
      organizationId: objectIdOrThrow(insight.organizationId),
      coachingSessionId: objectId(insight.coachingSessionId),
      agentId: objectId(insight.agentId),
      conversationId: objectId(insight.conversationId)
    });

    return toAgentCoachingInsight(created.toObject() as AnyDoc);
  }

  async findById(organizationId: string, id: string): Promise<AgentCoachingInsight | null> {
    const insight = await AgentCoachingInsightModel.findOne({
      _id: objectIdOrThrow(id),
      organizationId: objectIdOrThrow(organizationId)
    }).lean();

    return insight ? toAgentCoachingInsight(insight as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<AgentCoachingInsight[]> {
    const insights = await AgentCoachingInsightModel.find({
      organizationId: objectIdOrThrow(organizationId)
    })
      .sort(sortNewest)
      .limit(300)
      .lean();

    return insights.map((insight: unknown) => toAgentCoachingInsight(insight as AnyDoc));
  }
}

export class MongoAgentRecommendationRepository implements AgentRecommendationRepository {
  async create(recommendation: AgentRecommendation): Promise<AgentRecommendation> {
    const created = await AgentRecommendationModel.create({
      ...recommendation,
      _id: objectId(recommendation.id),
      organizationId: objectIdOrThrow(recommendation.organizationId),
      coachingSessionId: objectId(recommendation.coachingSessionId),
      agentId: objectId(recommendation.agentId),
      conversationId: objectId(recommendation.conversationId)
    });

    return toAgentRecommendation(created.toObject() as AnyDoc);
  }

  async findById(organizationId: string, id: string): Promise<AgentRecommendation | null> {
    const recommendation = await AgentRecommendationModel.findOne({
      _id: objectIdOrThrow(id),
      organizationId: objectIdOrThrow(organizationId)
    }).lean();

    return recommendation ? toAgentRecommendation(recommendation as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<AgentRecommendation[]> {
    const recommendations = await AgentRecommendationModel.find({
      organizationId: objectIdOrThrow(organizationId)
    })
      .sort(sortNewest)
      .limit(300)
      .lean();

    return recommendations.map((recommendation: unknown) => toAgentRecommendation(recommendation as AnyDoc));
  }
}

export class MongoComplianceAlertRepository implements ComplianceAlertRepository {
  async create(alert: ComplianceAlert): Promise<ComplianceAlert> {
    const created = await ComplianceAlertModel.create({
      ...alert,
      _id: objectId(alert.id),
      organizationId: objectIdOrThrow(alert.organizationId),
      coachingSessionId: objectId(alert.coachingSessionId),
      agentId: objectId(alert.agentId),
      conversationId: objectId(alert.conversationId)
    });

    return toComplianceAlert(created.toObject() as AnyDoc);
  }

  async findById(organizationId: string, id: string): Promise<ComplianceAlert | null> {
    const alert = await ComplianceAlertModel.findOne({
      _id: objectIdOrThrow(id),
      organizationId: objectIdOrThrow(organizationId)
    }).lean();

    return alert ? toComplianceAlert(alert as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<ComplianceAlert[]> {
    const alerts = await ComplianceAlertModel.find({
      organizationId: objectIdOrThrow(organizationId)
    })
      .sort(sortNewest)
      .limit(300)
      .lean();

    return alerts.map((alert: unknown) => toComplianceAlert(alert as AnyDoc));
  }
}

export class MongoConversationScorecardRepository implements ConversationScorecardRepository {
  async create(scorecard: ConversationScorecard): Promise<ConversationScorecard> {
    const created = await ConversationScorecardModel.findOneAndUpdate(
      {
        organizationId: objectIdOrThrow(scorecard.organizationId),
        coachingSessionId: objectId(scorecard.coachingSessionId)
      },
      {
        ...scorecard,
        _id: objectId(scorecard.id),
        organizationId: objectIdOrThrow(scorecard.organizationId),
        coachingSessionId: objectId(scorecard.coachingSessionId),
        agentId: objectId(scorecard.agentId),
        conversationId: objectId(scorecard.conversationId)
      },
      { new: true, upsert: true }
    ).lean();

    if (!created) {
      throw new Error("Failed to persist conversation scorecard");
    }

    return toConversationScorecard(created as AnyDoc);
  }

  async findById(organizationId: string, id: string): Promise<ConversationScorecard | null> {
    const scorecard = await ConversationScorecardModel.findOne({
      _id: objectIdOrThrow(id),
      organizationId: objectIdOrThrow(organizationId)
    }).lean();

    return scorecard ? toConversationScorecard(scorecard as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<ConversationScorecard[]> {
    const scorecards = await ConversationScorecardModel.find({
      organizationId: objectIdOrThrow(organizationId)
    })
      .sort(sortNewest)
      .limit(300)
      .lean();

    return scorecards.map((scorecard: unknown) => toConversationScorecard(scorecard as AnyDoc));
  }
}

export class MongoNextBestActionRepository implements NextBestActionRepository {
  async create(action: NextBestAction): Promise<NextBestAction> {
    const created = await NextBestActionModel.create({
      ...action,
      _id: objectId(action.id),
      organizationId: objectIdOrThrow(action.organizationId),
      coachingSessionId: objectId(action.coachingSessionId),
      agentId: objectId(action.agentId),
      conversationId: objectId(action.conversationId)
    });

    return toNextBestAction(created.toObject() as AnyDoc);
  }

  async findById(organizationId: string, id: string): Promise<NextBestAction | null> {
    const action = await NextBestActionModel.findOne({
      _id: objectIdOrThrow(id),
      organizationId: objectIdOrThrow(organizationId)
    }).lean();

    return action ? toNextBestAction(action as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<NextBestAction[]> {
    const actions = await NextBestActionModel.find({
      organizationId: objectIdOrThrow(organizationId)
    })
      .sort(sortNewest)
      .limit(300)
      .lean();

    return actions.map((action: unknown) => toNextBestAction(action as AnyDoc));
  }
}
