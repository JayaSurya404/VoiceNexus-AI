import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { z } from "zod";

import type { createContainer } from "../container.js";
import { env } from "../config/env.js";
import { AiBrainError } from "../shared/errors.js";
import {
  toAgentDecisionDto,
  toAgentCollaborationDecisionDto,
  toAgentCollaborationSessionDto,
  toAgentDelegationDto,
  toAgentPersonaDto,
  toAgentSessionDto,
  toAgentTaskDto,
  toAgentTeamDto,
  toAgentAvailabilityDto,
  toActionAuditDto,
  toAgentPerformanceDto,
  toBenchmarkMetricDto,
  toBusinessInsightDto,
  toConversationDto,
  toConversationAnalyticsDto,
  toConversationStateDto,
  toCrossSellOpportunityDto,
  toDealRiskDto,
  toCallOutcomeDto,
  toHumanAgentDto,
  toHumanAgentSessionDto,
  toKnowledgeCitationDto,
  toKnowledgeChunkDto,
  toKnowledgeDocumentDto,
  toKnowledgeFeedbackDto,
  toKnowledgeGapDto,
  toKnowledgeImprovementDto,
  toKnowledgeLearningEventDto,
  toKnowledgeSearchDto,
  toKnowledgeSuggestionDto,
  toLiveTakeoverDto,
  toMessageDto,
  toOpportunityDto,
  toOptimizationActionDto,
  toOptimizationEventDto,
  toOptimizationExperimentDto,
  toOptimizationGoalDto,
  toOptimizationMetricDto,
  toOptimizationRecommendationDto,
  toOptimizationResultDto,
  toOptimizationRuleDto,
  toExecutiveDashboardDto,
  toExecutiveSummaryDto,
  toGeneratedReportDto,
  toKpiMetricDto,
  toAgentSkillDto,
  toQualificationDto,
  toQueueDto,
  toQueueMemberDto,
  toQueueAnalyticsDto,
  toQueueSessionDto,
  toQualityScoreDto,
  toRevenueForecastDto,
  toRoutingDecisionDto,
  toRoutingRuleDto,
  toReportExportDto,
  toReportTemplateDto,
  toSalesInsightDto,
  toScheduledFollowupDto,
  toSentimentAnalysisDto,
  toSupervisorSessionDto,
  toToolExecutionDto,
  toTrendAnalysisDto,
  toUpsellOpportunityDto,
  toWhisperMessageDto,
  toWinLossAnalysisDto,
  toWorkflowActionDto,
  toWorkflowExecutionDto,
} from "./serializers.js";
import {
  serializeAgentCoachingInsight,
  serializeAgentCoachingSession,
  serializeAgentRecommendation,
  serializeCoachingEffectivenessMetrics,
  serializeComplianceAlert,
  serializeConversationScorecard,
  serializeNextBestAction,
} from "./coaching-serializers.js";
import type { AgentDecision } from "../domain/entities/agent-decision.js";
import type { AgentSession } from "../domain/entities/agent-session.js";
import type { LeadQualification } from "../domain/entities/lead-qualification.js";

type Container = ReturnType<typeof createContainer>;

const personaInputSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["SALES_AGENT", "SUPPORT_AGENT", "APPOINTMENT_SETTER", "COLLECTIONS_AGENT"]),
  systemPrompt: z.string().min(1),
  tone: z.string().min(1),
  goals: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  isDefault: z.boolean().default(false),
});

const humanAgentInputSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["AGENT", "SUPERVISOR", "MANAGER"]).default("AGENT"),
  skills: z.array(z.string()).default([]),
});

const availabilityInputSchema = z.object({
  organizationId: z.string().min(1),
  status: z.enum(["AVAILABLE", "BUSY", "OFFLINE", "BREAK"]),
  statusReason: z.string().nullable().optional(),
  capacity: z.number().int().min(1).optional(),
});

const joinSessionSchema = z.object({
  organizationId: z.string().min(1),
  aiSessionId: z.string().nullable().optional(),
  callId: z.string().nullable().optional(),
  leadId: z.string().nullable().optional(),
});

const takeoverInputSchema = z.object({
  organizationId: z.string().min(1),
  sessionId: z.string().min(1),
  agentId: z.string().min(1),
  supervisorId: z.string().nullable().optional(),
  reason: z.string().min(1),
});

const whisperInputSchema = z.object({
  organizationId: z.string().min(1),
  sessionId: z.string().min(1),
  senderId: z.string().min(1),
  senderRole: z.enum(["SUPERVISOR", "AGENT"]),
  target: z.enum(["AGENT", "AI"]),
  targetAgentId: z.string().nullable().optional(),
  content: z.string().min(1),
});

const queueInputSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(1),
  priority: z.number().int().min(0).default(0),
  maxWaitingTime: z.number().int().min(0).default(300),
  overflowQueueId: z.string().nullable().optional(),
  active: z.boolean().default(true),
});

const queueMemberInputSchema = z.object({
  organizationId: z.string().min(1),
  queueId: z.string().min(1),
  agentId: z.string().min(1),
  role: z.enum(["AGENT", "SUPERVISOR"]).default("AGENT"),
  active: z.boolean().default(true),
});

const routingRuleInputSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(1),
  priority: z.number().int().min(0).default(0),
  requiredSkills: z.array(z.string()).default([]),
  conditions: z.record(z.unknown()).default({}),
  targetQueueId: z.string().nullable().optional(),
  escalationQueueId: z.string().nullable().optional(),
  action: z.enum(["ASSIGN_QUEUE", "ESCALATE_QUEUE", "ESCALATE_SUPERVISOR"]).default("ASSIGN_QUEUE"),
  active: z.boolean().default(true),
});

const agentSkillInputSchema = z.object({
  organizationId: z.string().min(1),
  agentId: z.string().min(1),
  skill: z.string().min(1),
  level: z.number().int().min(1).max(5).default(1),
  certified: z.boolean().default(false),
  active: z.boolean().default(true),
});

const routingAssignInputSchema = z.object({
  organizationId: z.string().min(1),
  queueSessionId: z.string().nullable().optional(),
  queueId: z.string().nullable().optional(),
  callId: z.string().nullable().optional(),
  aiSessionId: z.string().nullable().optional(),
  leadId: z.string().nullable().optional(),
  source: z.enum(["AI", "AGENT", "QUEUE", "MANUAL"]).optional(),
  requiredSkills: z.array(z.string()).default([]),
  priority: z.number().int().min(0).optional(),
  reason: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
});

const knowledgeUploadInputSchema = z.object({
  organizationId: z.string().min(1),
  knowledgeBaseId: z.string().nullable().optional(),
  title: z.string().min(1),
  sourceName: z.string().min(1),
  documentType: z.enum(["PDF", "DOCX", "TXT", "MARKDOWN"]),
  content: z.string().min(1),
  encoding: z.enum(["text", "base64"]).default("text"),
  uploadedBy: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
});

const knowledgeSearchInputSchema = z.object({
  organizationId: z.string().min(1),
  query: z.string().min(1),
  transcript: z.string().nullable().optional(),
  crmContext: z.record(z.unknown()).default({}),
  memoryContext: z.record(z.unknown()).default({}),
  conversationId: z.string().nullable().optional(),
  agentSessionId: z.string().nullable().optional(),
});

const knowledgeFeedbackInputSchema = z.object({
  organizationId: z.string().min(1),
  searchId: z.string().nullable().optional(),
  citationId: z.string().nullable().optional(),
  conversationId: z.string().nullable().optional(),
  agentSessionId: z.string().nullable().optional(),
  chunkId: z.string().nullable().optional(),
  type: z.enum(["HELPFUL", "UNHELPFUL", "ESCALATED_CALL", "HUMAN_TAKEOVER", "LOW_CONFIDENCE_RESPONSE", "FAILED_SEARCH"]),
  retrievalUsage: z.enum(["RETRIEVED", "USED", "IGNORED", "HELPFUL", "UNHELPFUL"]),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  comment: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
});

const agentTeamInputSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  agents: z.array(z.object({
    agentId: z.string().min(1),
    type: z.enum(["SalesAgent", "SupportAgent", "TechnicalAgent", "SchedulerAgent", "QAAgent", "SupervisorAgent"]),
    role: z.string().min(1),
    active: z.boolean().default(true),
  })).default([]),
  objectives: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

const suggestionReviewSchema = z.object({
  organizationId: z.string().min(1),
  reviewedBy: z.string().nullable().optional(),
});

export function createAiBrainHttpServer(container: Container) {
  return createServer((request, response) => {
    void handleRequest(container, request, response);
  });
}

async function handleRequest(container: Container, request: IncomingMessage, response: ServerResponse): Promise<void> {
  applyCors(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, { data: { status: "ok", service: "voicenexus-ai-brain", uptime: process.uptime() } });
      return;
    }

    const token = bearerToken(request);
    if (!token) throw AiBrainError.unauthorized();

    if (url.pathname === "/agents" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.humanAgents.listByOrganization(organizationId)).map(toHumanAgentDto) });
      return;
    }

    if (url.pathname === "/analytics/overview" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: await container.services.analyticsEngine.overview(organizationId) });
      return;
    }

    if (url.pathname === "/analytics/conversations" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.services.analyticsEngine.refreshOrganization(organizationId);
      sendJson(response, 200, { data: (await container.repositories.conversationAnalytics.listByOrganization(organizationId)).map(toConversationAnalyticsDto) });
      return;
    }

    if (url.pathname === "/analytics/agents" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.services.analyticsEngine.refreshOrganization(organizationId);
      sendJson(response, 200, { data: (await container.repositories.agentPerformances.listByOrganization(organizationId)).map(toAgentPerformanceDto) });
      return;
    }

    if (url.pathname === "/analytics/queues" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.services.analyticsEngine.refreshOrganization(organizationId);
      sendJson(response, 200, { data: (await container.repositories.queueAnalytics.listByOrganization(organizationId)).map(toQueueAnalyticsDto) });
      return;
    }

    if (url.pathname === "/analytics/conversions" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.services.analyticsEngine.refreshOrganization(organizationId);
      sendJson(response, 200, { data: await container.services.conversionAnalytics.summarize(organizationId) });
      return;
    }

    if (url.pathname === "/analytics/outcomes" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.services.analyticsEngine.refreshOrganization(organizationId);
      sendJson(response, 200, { data: (await container.repositories.callOutcomes.listByOrganization(organizationId)).map(toCallOutcomeDto) });
      return;
    }

    if (url.pathname === "/analytics/sentiment" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.services.analyticsEngine.refreshOrganization(organizationId);
      sendJson(response, 200, { data: (await container.repositories.sentimentAnalyses.listByOrganization(organizationId)).map(toSentimentAnalysisDto) });
      return;
    }

    if (url.pathname === "/analytics/quality" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.services.analyticsEngine.refreshOrganization(organizationId);
      sendJson(response, 200, { data: (await container.repositories.qualityScores.listByOrganization(organizationId)).map(toQualityScoreDto) });
      return;
    }

    if (url.pathname === "/analytics/revenue" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await Promise.all([
        container.services.dealRisk.analyzeOrganization(organizationId),
        container.services.winLoss.analyzeOrganization(organizationId),
        container.services.upsellIntelligence.identifyUpsell(organizationId),
        container.services.upsellIntelligence.identifyCrossSell(organizationId),
        container.services.salesInsight.generate(organizationId),
      ]);
      sendJson(response, 200, { data: await container.services.revenueAnalytics.summarize(organizationId) });
      return;
    }

    if (url.pathname === "/analytics/revenue/forecast" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.revenueForecast.list(organizationId)).map(toRevenueForecastDto) });
      return;
    }

    if (url.pathname === "/analytics/revenue/risks" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.dealRisk.analyzeOrganization(organizationId)).map(toDealRiskDto) });
      return;
    }

    if (url.pathname === "/analytics/revenue/opportunities" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.opportunityIntelligence.enrichScores(organizationId)).map(toOpportunityDto) });
      return;
    }

    if (url.pathname === "/analytics/revenue/win-loss" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.winLoss.analyzeOrganization(organizationId)).map(toWinLossAnalysisDto) });
      return;
    }

    if (url.pathname === "/analytics/revenue/insights" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.salesInsight.generate(organizationId)).map(toSalesInsightDto) });
      return;
    }

    if (url.pathname === "/analytics/revenue/upsell" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.upsellIntelligence.identifyUpsell(organizationId)).map(toUpsellOpportunityDto) });
      return;
    }

    if (url.pathname === "/analytics/revenue/cross-sell" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.upsellIntelligence.identifyCrossSell(organizationId)).map(toCrossSellOpportunityDto) });
      return;
    }

    if (url.pathname === "/reports/dashboard" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: toExecutiveDashboardDto(await container.services.executiveDashboard.getDashboard(organizationId)) });
      return;
    }

    if (url.pathname === "/reports/kpis" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.kpiReporting.refresh(organizationId)).map(toKpiMetricDto) });
      return;
    }

    if (url.pathname === "/reports/trends" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.trendAnalysisService.calculate(organizationId)).map(toTrendAnalysisDto) });
      return;
    }

    if (url.pathname === "/reports/benchmarks" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.benchmarkService.calculate(organizationId)).map(toBenchmarkMetricDto) });
      return;
    }

    if (url.pathname === "/reports/insights" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.businessInsight.generate(organizationId)).map(toBusinessInsightDto) });
      return;
    }

    if (url.pathname === "/reports/summaries" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.executiveSummary.generate(organizationId)).map(toExecutiveSummaryDto) });
      return;
    }

    if (url.pathname === "/reports/templates" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.reportBuilder.templatesForOrganization(organizationId)).map(toReportTemplateDto) });
      return;
    }

    if (url.pathname === "/reports/generated" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.reportBuilder.generatedReports(organizationId)).map(toGeneratedReportDto) });
      return;
    }

    if (url.pathname === "/reports/exports" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.reportExport.list(organizationId)).map(toReportExportDto) });
      return;
    }

    if (url.pathname === "/optimization/overview" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: await container.services.optimizationEngine.overview(organizationId) });
      return;
    }

    if (url.pathname === "/optimization/rules" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.optimizationRule.list(organizationId)).map(toOptimizationRuleDto) });
      return;
    }

    if (url.pathname === "/optimization/events" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.optimizationEvents.listByOrganization(organizationId)).map(toOptimizationEventDto) });
      return;
    }

    if (url.pathname === "/optimization/actions" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.optimizationAction.createActions(organizationId)).map(toOptimizationActionDto) });
      return;
    }

    if (url.pathname === "/optimization/recommendations" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.optimizationRecommendation.generate(organizationId)).map(toOptimizationRecommendationDto) });
      return;
    }

    if (url.pathname === "/optimization/metrics" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.optimizationMonitor.monitor(organizationId)).map(toOptimizationMetricDto) });
      return;
    }

    if (url.pathname === "/optimization/goals" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.optimizationGoals.listByOrganization(organizationId)).map(toOptimizationGoalDto) });
      return;
    }

    if (url.pathname === "/optimization/experiments" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.optimizationExperiments.listByOrganization(organizationId)).map(toOptimizationExperimentDto) });
      return;
    }

    if (url.pathname === "/optimization/results" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.optimizationResults.listByOrganization(organizationId)).map(toOptimizationResultDto) });
      return;
    }

    if (url.pathname === "/knowledge/upload" && request.method === "POST") {
      const input = knowledgeUploadInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      const document = await container.services.knowledgeIngestion.upload({
        ...input,
        knowledgeBaseId: input.knowledgeBaseId ?? null,
        uploadedBy: input.uploadedBy ?? null,
      });
      const chunks = await container.repositories.knowledgeChunks.listByDocument(input.organizationId, document.id);
      sendJson(response, 201, {
        data: {
          document: toKnowledgeDocumentDto(document),
          chunks: chunks.map(toKnowledgeChunkDto),
        },
      });
      return;
    }

    if (url.pathname === "/knowledge/documents" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: (await container.repositories.knowledgeDocuments.listByOrganization(organizationId)).map(toKnowledgeDocumentDto),
      });
      return;
    }

    const knowledgeDocumentMatch = /^\/knowledge\/documents\/([^/]+)$/.exec(url.pathname);
    if (knowledgeDocumentMatch?.[1] && request.method === "GET") {
      const document = await container.repositories.knowledgeDocuments.findById(knowledgeDocumentMatch[1]);
      if (!document) throw AiBrainError.notFound("Knowledge document");
      await authorize(container, token, document.organizationId);
      const chunks = await container.repositories.knowledgeChunks.listByDocument(document.organizationId, document.id);
      sendJson(response, 200, {
        data: {
          document: toKnowledgeDocumentDto(document),
          chunks: chunks.map(toKnowledgeChunkDto),
        },
      });
      return;
    }

    if (knowledgeDocumentMatch?.[1] && request.method === "DELETE") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.repositories.knowledgeChunks.deleteByDocument(organizationId, knowledgeDocumentMatch[1]);
      sendJson(response, 200, {
        data: { deleted: await container.repositories.knowledgeDocuments.delete(knowledgeDocumentMatch[1], organizationId) },
      });
      return;
    }

    if (url.pathname === "/knowledge/search" && request.method === "POST") {
      const input = knowledgeSearchInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      const result = await container.services.ragRuntime.buildContext({
        organizationId: input.organizationId,
        query: input.query,
        transcript: input.transcript ?? null,
        crmContext: input.crmContext,
        memoryContext: input.memoryContext,
        conversationId: input.conversationId ?? null,
        agentSessionId: input.agentSessionId ?? null,
      });
      sendJson(response, 200, {
        data: {
          chunks: result.chunks.map(toKnowledgeChunkDto),
          citations: result.citations.map(toKnowledgeCitationDto),
          confidence: result.confidence,
          contextText: result.contextText,
        },
      });
      return;
    }

    if (url.pathname === "/knowledge/searches" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: (await container.repositories.knowledgeSearches.listByOrganization(organizationId)).map(toKnowledgeSearchDto),
      });
      return;
    }

    if (url.pathname === "/knowledge/citations" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: (await container.repositories.knowledgeCitations.listByOrganization(organizationId)).map(toKnowledgeCitationDto),
      });
      return;
    }

    if (url.pathname === "/knowledge/feedback" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: (await container.repositories.knowledgeFeedback.listByOrganization(organizationId)).map(toKnowledgeFeedbackDto),
      });
      return;
    }

    if (url.pathname === "/knowledge/feedback" && request.method === "POST") {
      const input = knowledgeFeedbackInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      sendJson(response, 201, {
        data: toKnowledgeFeedbackDto(
          await container.services.knowledgeFeedbackService.create({
            ...input,
            searchId: input.searchId ?? null,
            citationId: input.citationId ?? null,
            conversationId: input.conversationId ?? null,
            agentSessionId: input.agentSessionId ?? null,
            chunkId: input.chunkId ?? null,
            rating: input.rating ?? null,
            comment: input.comment ?? null,
            createdBy: input.createdBy ?? null,
          }),
        ),
      });
      return;
    }

    if (url.pathname === "/knowledge/gaps" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.services.knowledgeGapAnalysis.analyzeOrganization(organizationId);
      sendJson(response, 200, {
        data: (await container.repositories.knowledgeGaps.listByOrganization(organizationId)).map(toKnowledgeGapDto),
      });
      return;
    }

    if (url.pathname === "/knowledge/suggestions" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.services.knowledgeSuggestion.generateForOrganization(organizationId);
      sendJson(response, 200, {
        data: (await container.repositories.knowledgeSuggestions.listByOrganization(organizationId)).map(toKnowledgeSuggestionDto),
      });
      return;
    }

    const suggestionApproveMatch = /^\/knowledge\/suggestions\/([^/]+)\/approve$/.exec(url.pathname);
    if (suggestionApproveMatch?.[1] && request.method === "POST") {
      const input = suggestionReviewSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      const suggestion = await container.services.knowledgeSuggestion.approve(suggestionApproveMatch[1], input.organizationId, input.reviewedBy ?? null);
      if (!suggestion) throw AiBrainError.notFound("Knowledge suggestion");
      sendJson(response, 200, { data: toKnowledgeSuggestionDto(suggestion) });
      return;
    }

    const suggestionRejectMatch = /^\/knowledge\/suggestions\/([^/]+)\/reject$/.exec(url.pathname);
    if (suggestionRejectMatch?.[1] && request.method === "POST") {
      const input = suggestionReviewSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      const suggestion = await container.services.knowledgeSuggestion.reject(suggestionRejectMatch[1], input.organizationId, input.reviewedBy ?? null);
      if (!suggestion) throw AiBrainError.notFound("Knowledge suggestion");
      sendJson(response, 200, { data: toKnowledgeSuggestionDto(suggestion) });
      return;
    }

    if (url.pathname === "/knowledge/learning-events" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: (await container.repositories.knowledgeLearningEvents.listByOrganization(organizationId)).map(toKnowledgeLearningEventDto),
      });
      return;
    }

    if (url.pathname === "/knowledge/improvements" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.services.knowledgeImprovement.scoreOrganization(organizationId);
      sendJson(response, 200, {
        data: (await container.repositories.knowledgeImprovements.listByOrganization(organizationId)).map(toKnowledgeImprovementDto),
      });
      return;
    }

    if (url.pathname === "/agents" && request.method === "POST") {
      const input = humanAgentInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      sendJson(response, 201, { data: toHumanAgentDto(await container.services.agentManagement.create(input)) });
      return;
    }

    if (url.pathname === "/agents/availability" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.agentAvailability.listByOrganization(organizationId)).map(toAgentAvailabilityDto) });
      return;
    }

    if (url.pathname === "/ai/teams" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.agentTeamService.list(organizationId)).map(toAgentTeamDto) });
      return;
    }

    if (url.pathname === "/ai/teams" && request.method === "POST") {
      const input = agentTeamInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      sendJson(response, 201, { data: toAgentTeamDto(await container.services.agentTeamService.create({ ...input, description: input.description ?? null })) });
      return;
    }

    const aiTeamMatch = /^\/ai\/teams\/([^/]+)$/.exec(url.pathname);
    if (aiTeamMatch?.[1] && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const team = await container.services.agentTeamService.get(aiTeamMatch[1], organizationId);
      if (!team) throw AiBrainError.notFound("Agent team");
      sendJson(response, 200, { data: toAgentTeamDto(team) });
      return;
    }

    if (aiTeamMatch?.[1] && request.method === "PUT") {
      const input = agentTeamInputSchema.partial().extend({ organizationId: z.string().min(1) }).parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      const updated = await container.services.agentTeamService.update(aiTeamMatch[1], input.organizationId, input);
      if (!updated) throw AiBrainError.notFound("Agent team");
      sendJson(response, 200, { data: toAgentTeamDto(updated) });
      return;
    }

    if (aiTeamMatch?.[1] && request.method === "DELETE") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: { deleted: await container.services.agentTeamService.delete(aiTeamMatch[1], organizationId) } });
      return;
    }

    if (url.pathname === "/ai/tasks" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.agentTaskService.list(organizationId)).map(toAgentTaskDto) });
      return;
    }

    const aiTaskMatch = /^\/ai\/tasks\/([^/]+)$/.exec(url.pathname);
    if (aiTaskMatch?.[1] && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const task = await container.services.agentTaskService.get(aiTaskMatch[1], organizationId);
      if (!task) throw AiBrainError.notFound("Agent task");
      sendJson(response, 200, { data: toAgentTaskDto(task) });
      return;
    }

    if (url.pathname === "/ai/delegations" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.agentDelegationService.list(organizationId)).map(toAgentDelegationDto) });
      return;
    }

    const aiDelegationMatch = /^\/ai\/delegations\/([^/]+)$/.exec(url.pathname);
    if (aiDelegationMatch?.[1] && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const delegation = await container.services.agentDelegationService.get(aiDelegationMatch[1], organizationId);
      if (!delegation) throw AiBrainError.notFound("Agent delegation");
      sendJson(response, 200, { data: toAgentDelegationDto(delegation) });
      return;
    }

    if (url.pathname === "/ai/collaborations" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: {
          sessions: (await container.services.agentCollaborationService.list(organizationId)).map(toAgentCollaborationSessionDto),
          decisions: (await container.repositories.agentCollaborationDecisions.listByOrganization(organizationId)).map(toAgentCollaborationDecisionDto),
          metrics: await container.services.agentCollaborationService.metrics(organizationId),
        },
      });
      return;
    }

    const aiCollaborationMatch = /^\/ai\/collaborations\/([^/]+)$/.exec(url.pathname);
    if (aiCollaborationMatch?.[1] && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const collaboration = await container.services.agentCollaborationService.get(aiCollaborationMatch[1], organizationId);
      if (!collaboration) throw AiBrainError.notFound("Agent collaboration");
      sendJson(response, 200, {
        data: {
          session: toAgentCollaborationSessionDto(collaboration),
          decisions: (await container.repositories.agentCollaborationDecisions.listBySession(organizationId, collaboration.id)).map(toAgentCollaborationDecisionDto),
        },
      });
      return;
    }

    if (url.pathname === "/ai/coaching/sessions" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: (await container.services.agentCoachingService.listSessions(organizationId)).map(serializeAgentCoachingSession),
      });
      return;
    }

    const coachingSessionMatch = /^\/ai\/coaching\/sessions\/([^/]+)$/.exec(url.pathname);
    if (coachingSessionMatch?.[1] && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const session = await container.services.agentCoachingService.getSession(organizationId, coachingSessionMatch[1]);
      if (!session) throw AiBrainError.notFound("Agent coaching session");
      sendJson(response, 200, { data: serializeAgentCoachingSession(session) });
      return;
    }

    if (url.pathname === "/ai/coaching/insights" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: (await container.services.agentCoachingService.listInsights(organizationId)).map(serializeAgentCoachingInsight),
      });
      return;
    }

    const coachingInsightMatch = /^\/ai\/coaching\/insights\/([^/]+)$/.exec(url.pathname);
    if (coachingInsightMatch?.[1] && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const insight = await container.services.agentCoachingService.getInsight(organizationId, coachingInsightMatch[1]);
      if (!insight) throw AiBrainError.notFound("Agent coaching insight");
      sendJson(response, 200, { data: serializeAgentCoachingInsight(insight) });
      return;
    }

    if (url.pathname === "/ai/coaching/metrics" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: serializeCoachingEffectivenessMetrics(await container.services.agentCoachingService.getEffectivenessMetrics(organizationId)),
      });
      return;
    }

    if (url.pathname === "/ai/recommendations" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: (await container.services.nextBestActionService.listRecommendations(organizationId)).map(serializeAgentRecommendation),
      });
      return;
    }

    const recommendationMatch = /^\/ai\/recommendations\/([^/]+)$/.exec(url.pathname);
    if (recommendationMatch?.[1] && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const recommendation = await container.services.nextBestActionService.getRecommendation(organizationId, recommendationMatch[1]);
      if (!recommendation) throw AiBrainError.notFound("Agent recommendation");
      sendJson(response, 200, { data: serializeAgentRecommendation(recommendation) });
      return;
    }

    if (url.pathname === "/ai/compliance-alerts" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: (await container.services.complianceMonitor.list(organizationId)).map(serializeComplianceAlert),
      });
      return;
    }

    const complianceAlertMatch = /^\/ai\/compliance-alerts\/([^/]+)$/.exec(url.pathname);
    if (complianceAlertMatch?.[1] && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const alert = await container.services.complianceMonitor.get(organizationId, complianceAlertMatch[1]);
      if (!alert) throw AiBrainError.notFound("Compliance alert");
      sendJson(response, 200, { data: serializeComplianceAlert(alert) });
      return;
    }

    if (url.pathname === "/ai/scorecards" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: (await container.services.scorecardService.list(organizationId)).map(serializeConversationScorecard),
      });
      return;
    }

    const scorecardMatch = /^\/ai\/scorecards\/([^/]+)$/.exec(url.pathname);
    if (scorecardMatch?.[1] && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const scorecard = await container.services.scorecardService.get(organizationId, scorecardMatch[1]);
      if (!scorecard) throw AiBrainError.notFound("Conversation scorecard");
      sendJson(response, 200, { data: serializeConversationScorecard(scorecard) });
      return;
    }

    if (url.pathname === "/ai/next-best-actions" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, {
        data: (await container.services.nextBestActionService.listActions(organizationId)).map(serializeNextBestAction),
      });
      return;
    }

    const nextBestActionMatch = /^\/ai\/next-best-actions\/([^/]+)$/.exec(url.pathname);
    if (nextBestActionMatch?.[1] && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const action = await container.services.nextBestActionService.getAction(organizationId, nextBestActionMatch[1]);
      if (!action) throw AiBrainError.notFound("Next best action");
      sendJson(response, 200, { data: serializeNextBestAction(action) });
      return;
    }

    const agentAvailabilityMatch = /^\/agents\/([^/]+)\/availability$/.exec(url.pathname);
    if (agentAvailabilityMatch?.[1] && request.method === "PUT") {
      const input = availabilityInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      const result = await container.services.agentManagement.setAvailability({
        organizationId: input.organizationId,
        agentId: agentAvailabilityMatch[1],
        status: input.status,
        statusReason: input.statusReason,
        capacity: input.capacity,
      });
      sendJson(response, 200, {
        data: {
          agent: result.agent ? toHumanAgentDto(result.agent) : null,
          availability: toAgentAvailabilityDto(result.availability),
        },
      });
      return;
    }

    const agentJoinMatch = /^\/agents\/([^/]+)\/sessions$/.exec(url.pathname);
    if (agentJoinMatch?.[1] && request.method === "POST") {
      const input = joinSessionSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      sendJson(response, 201, {
        data: toHumanAgentSessionDto(
          await container.services.agentManagement.joinSession({
            organizationId: input.organizationId,
            agentId: agentJoinMatch[1],
            aiSessionId: input.aiSessionId,
            callId: input.callId,
            leadId: input.leadId,
          }),
        ),
      });
      return;
    }

    const agentMatch = /^\/agents\/([^/]+)$/.exec(url.pathname);
    if (agentMatch?.[1] && request.method === "GET") {
      const agent = await container.repositories.humanAgents.findById(agentMatch[1]);
      if (!agent) throw AiBrainError.notFound("Agent");
      await authorize(container, token, agent.organizationId);
      sendJson(response, 200, { data: toHumanAgentDto(agent) });
      return;
    }

    if (agentMatch?.[1] && request.method === "PUT") {
      const input = humanAgentInputSchema.partial().extend({ organizationId: z.string().min(1) }).parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      const updated = await container.repositories.humanAgents.update(agentMatch[1], input.organizationId, input);
      if (!updated) throw AiBrainError.notFound("Agent");
      sendJson(response, 200, { data: toHumanAgentDto(updated) });
      return;
    }

    if (agentMatch?.[1] && request.method === "DELETE") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: { deleted: await container.repositories.humanAgents.delete(agentMatch[1], organizationId) } });
      return;
    }

    if (url.pathname === "/takeovers" && request.method === "POST") {
      const input = takeoverInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      sendJson(response, 201, { data: toLiveTakeoverDto(await container.services.liveTakeover.request(input)) });
      return;
    }

    if (url.pathname === "/takeovers" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.liveTakeovers.listByOrganization(organizationId)).map(toLiveTakeoverDto) });
      return;
    }

    const takeoverStartMatch = /^\/takeovers\/([^/]+)\/start$/.exec(url.pathname);
    if (takeoverStartMatch?.[1] && request.method === "POST") {
      const takeover = await container.repositories.liveTakeovers.findById(takeoverStartMatch[1]);
      if (!takeover) throw AiBrainError.notFound("Takeover");
      await authorize(container, token, takeover.organizationId);
      const approved = takeover.status === "REQUESTED" ? await container.services.liveTakeover.approve(takeover.id) : takeover;
      const started = await container.services.liveTakeover.start(approved?.id ?? takeover.id);
      if (!started) throw AiBrainError.notFound("Takeover");
      sendJson(response, 200, { data: toLiveTakeoverDto(started) });
      return;
    }

    const takeoverEndMatch = /^\/takeovers\/([^/]+)\/end$/.exec(url.pathname);
    if (takeoverEndMatch?.[1] && request.method === "POST") {
      const takeover = await container.repositories.liveTakeovers.findById(takeoverEndMatch[1]);
      if (!takeover) throw AiBrainError.notFound("Takeover");
      await authorize(container, token, takeover.organizationId);
      const ended = await container.services.liveTakeover.end(takeover.id, true);
      if (!ended) throw AiBrainError.notFound("Takeover");
      sendJson(response, 200, { data: toLiveTakeoverDto(ended) });
      return;
    }

    const takeoverMatch = /^\/takeovers\/([^/]+)$/.exec(url.pathname);
    if (takeoverMatch?.[1] && request.method === "GET") {
      const takeover = await container.repositories.liveTakeovers.findById(takeoverMatch[1]);
      if (!takeover) throw AiBrainError.notFound("Takeover");
      await authorize(container, token, takeover.organizationId);
      sendJson(response, 200, { data: toLiveTakeoverDto(takeover) });
      return;
    }

    if (url.pathname === "/whispers" && request.method === "POST") {
      const input = whisperInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      sendJson(response, 201, { data: toWhisperMessageDto(await container.services.whisperService.create(input)) });
      return;
    }

    if (url.pathname === "/whispers" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.whispers.listByOrganization(organizationId)).map(toWhisperMessageDto) });
      return;
    }

    const whisperMatch = /^\/whispers\/([^/]+)$/.exec(url.pathname);
    if (whisperMatch?.[1] && request.method === "GET") {
      const whisper = await container.repositories.whispers.findById(whisperMatch[1]);
      if (!whisper) throw AiBrainError.notFound("Whisper");
      await authorize(container, token, whisper.organizationId);
      sendJson(response, 200, { data: toWhisperMessageDto(whisper) });
      return;
    }

    if (url.pathname === "/supervisor/overview" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: await container.services.supervisorConsole.overview(organizationId) });
      return;
    }

    if (url.pathname === "/supervisor/agents" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.services.supervisorConsole.activeAgents(organizationId)).map(toHumanAgentDto) });
      return;
    }

    if (url.pathname === "/supervisor/sessions" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.humanAgentSessions.listByOrganization(organizationId)).map(toHumanAgentSessionDto) });
      return;
    }

    if (url.pathname === "/supervisor/takeovers" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.liveTakeovers.listByOrganization(organizationId)).map(toLiveTakeoverDto) });
      return;
    }

    if (url.pathname === "/supervisor/queue-health" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: await container.services.routingEngine.queueHealth(organizationId) });
      return;
    }

    if (url.pathname === "/supervisor/sessions" && request.method === "POST") {
      const input = z.object({ organizationId: z.string().min(1), supervisorId: z.string().min(1), watchedSessionIds: z.array(z.string()).default([]) }).parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      const session = await container.repositories.supervisorSessions.create({
        organizationId: input.organizationId,
        supervisorId: input.supervisorId,
        status: "ACTIVE",
        startedAt: new Date(),
        endedAt: null,
        watchedSessionIds: input.watchedSessionIds,
      });
      await container.services.humanConsoleEvents.publish("supervisor.joined", {
        organizationId: input.organizationId,
        sessionId: session.id,
        payload: { supervisorId: input.supervisorId, watchedSessionIds: input.watchedSessionIds },
      });
      sendJson(response, 201, { data: toSupervisorSessionDto(session) });
      return;
    }

    if (url.pathname === "/queues" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      const agentId = url.searchParams.get("agentId");
      await authorize(container, token, organizationId);
      if (agentId) {
        const memberships = (await container.repositories.queueMembers.listByAgent(organizationId, agentId)).filter((member) => member.active);
        const memberQueueIds = new Set(memberships.map((member) => member.queueId));
        const queues = (await container.services.routingEngine.ensureDefaultQueues(organizationId)).filter((queue) => memberQueueIds.has(queue.id));
        sendJson(response, 200, { data: queues.map(toQueueDto) });
        return;
      }
      sendJson(response, 200, { data: (await container.services.routingEngine.ensureDefaultQueues(organizationId)).map(toQueueDto) });
      return;
    }

    if (url.pathname === "/queues" && request.method === "POST") {
      const input = queueInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      sendJson(response, 201, { data: toQueueDto(await container.services.routingEngine.createQueue({ ...input, overflowQueueId: input.overflowQueueId ?? null })) });
      return;
    }

    if (url.pathname === "/queues/members" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      const queueId = url.searchParams.get("queueId");
      const agentId = url.searchParams.get("agentId");
      await authorize(container, token, organizationId);
      const members = agentId
        ? await container.repositories.queueMembers.listByAgent(organizationId, agentId)
        : queueId
          ? await container.repositories.queueMembers.listByQueue(organizationId, queueId)
          : await container.repositories.queueMembers.listByOrganization(organizationId);
      sendJson(response, 200, { data: members.map(toQueueMemberDto) });
      return;
    }

    if (url.pathname === "/queues/members" && request.method === "POST") {
      const input = queueMemberInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      sendJson(response, 201, { data: toQueueMemberDto(await container.repositories.queueMembers.create(input)) });
      return;
    }

    if (url.pathname === "/routing/rules" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.routingRules.listByOrganization(organizationId)).map(toRoutingRuleDto) });
      return;
    }

    if (url.pathname === "/routing/rules" && request.method === "POST") {
      const input = routingRuleInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      sendJson(response, 201, {
        data: toRoutingRuleDto(
          await container.repositories.routingRules.create({
            ...input,
            targetQueueId: input.targetQueueId ?? null,
            escalationQueueId: input.escalationQueueId ?? null,
          }),
        ),
      });
      return;
    }

    const routingRuleMatch = /^\/routing\/rules\/([^/]+)$/.exec(url.pathname);
    if (routingRuleMatch?.[1] && request.method === "PUT") {
      const input = routingRuleInputSchema.partial().extend({ organizationId: z.string().min(1) }).parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      const updated = await container.repositories.routingRules.update(routingRuleMatch[1], input.organizationId, input);
      if (!updated) throw AiBrainError.notFound("Routing rule");
      sendJson(response, 200, { data: toRoutingRuleDto(updated) });
      return;
    }

    const queueMatch = /^\/queues\/([^/]+)$/.exec(url.pathname);
    if (queueMatch?.[1] && request.method === "GET") {
      const queue = await container.repositories.queues.findById(queueMatch[1]);
      if (!queue) throw AiBrainError.notFound("Queue");
      await authorize(container, token, queue.organizationId);
      sendJson(response, 200, { data: toQueueDto(queue) });
      return;
    }

    if (queueMatch?.[1] && request.method === "PUT") {
      const input = queueInputSchema.partial().extend({ organizationId: z.string().min(1) }).parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      const updated = await container.services.routingEngine.updateQueue(queueMatch[1], input.organizationId, input);
      if (!updated) throw AiBrainError.notFound("Queue");
      sendJson(response, 200, { data: toQueueDto(updated) });
      return;
    }

    if (queueMatch?.[1] && request.method === "DELETE") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: { deleted: await container.repositories.queues.delete(queueMatch[1], organizationId) } });
      return;
    }

    if (url.pathname === "/skills" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      const agentId = url.searchParams.get("agentId");
      await authorize(container, token, organizationId);
      const skills = agentId
        ? await container.repositories.agentSkills.listByAgent(organizationId, agentId)
        : await container.repositories.agentSkills.listByOrganization(organizationId);
      sendJson(response, 200, { data: skills.map(toAgentSkillDto) });
      return;
    }

    if (url.pathname === "/skills" && request.method === "POST") {
      const input = agentSkillInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      sendJson(response, 201, { data: toAgentSkillDto(await container.repositories.agentSkills.create(input)) });
      return;
    }

    const skillMatch = /^\/skills\/([^/]+)$/.exec(url.pathname);
    if (skillMatch?.[1] && request.method === "PUT") {
      const input = agentSkillInputSchema.partial().extend({ organizationId: z.string().min(1) }).parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      const updated = await container.repositories.agentSkills.update(skillMatch[1], input.organizationId, input);
      if (!updated) throw AiBrainError.notFound("Agent skill");
      sendJson(response, 200, { data: toAgentSkillDto(updated) });
      return;
    }

    if (url.pathname === "/routing/assign" && request.method === "POST") {
      const input = routingAssignInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      const result = await container.services.routingEngine.assign({ ...input, reason: input.reason ?? undefined });
      sendJson(response, 200, {
        data: {
          queueSession: result.queueSession ? toQueueSessionDto(result.queueSession) : null,
          queue: result.queue ? toQueueDto(result.queue) : null,
          agent: result.agent ? toHumanAgentDto(result.agent) : null,
          decision: toRoutingDecisionDto(result.decision),
          escalationPath: result.escalationPath.map(toQueueDto),
        },
      });
      return;
    }

    if (url.pathname === "/routing/decisions" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      const limit = Number(url.searchParams.get("limit") ?? 100);
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.routingDecisions.listByOrganization(organizationId, limit)).map(toRoutingDecisionDto) });
      return;
    }

    if (url.pathname === "/queue-sessions" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      const queueId = url.searchParams.get("queueId");
      const agentId = url.searchParams.get("agentId");
      await authorize(container, token, organizationId);
      const sessions = agentId
        ? await container.repositories.queueSessions.listByAgent(organizationId, agentId)
        : queueId
          ? await container.repositories.queueSessions.listByQueue(organizationId, queueId)
          : await container.repositories.queueSessions.listByOrganization(organizationId);
      sendJson(response, 200, { data: sessions.map(toQueueSessionDto) });
      return;
    }

    const queueSessionMatch = /^\/queue-sessions\/([^/]+)$/.exec(url.pathname);
    if (queueSessionMatch?.[1] && request.method === "GET") {
      const session = await container.repositories.queueSessions.findById(queueSessionMatch[1]);
      if (!session) throw AiBrainError.notFound("Queue session");
      await authorize(container, token, session.organizationId);
      sendJson(response, 200, { data: toQueueSessionDto(session) });
      return;
    }

    const assistMatch = /^\/assist\/([^/]+)$/.exec(url.pathname);
    if (assistMatch?.[1] && request.method === "GET") {
      const aiSession = await container.repositories.sessions.findById(assistMatch[1]);
      if (!aiSession) throw AiBrainError.notFound("AI session");
      await authorize(container, token, aiSession.organizationId);
      const suggestion = await container.services.agentAssist.suggest(aiSession.id);
      sendJson(response, 200, { data: suggestion });
      return;
    }

    if (url.pathname === "/ai/personas" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.services.personaService.ensureDefaults(organizationId);
      sendJson(response, 200, { data: (await container.repositories.personas.listByOrganization(organizationId)).map(toAgentPersonaDto) });
      return;
    }

    if (url.pathname === "/ai/personas" && request.method === "POST") {
      const input = personaInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      sendJson(response, 201, { data: toAgentPersonaDto(await container.repositories.personas.create(input)) });
      return;
    }

    const personaMatch = /^\/ai\/personas\/([^/]+)$/.exec(url.pathname);
    if (personaMatch?.[1] && (request.method === "PUT" || request.method === "DELETE")) {
      const body = request.method === "PUT" ? await readJson(request) : {};
      const organizationId = request.method === "DELETE" ? requiredQuery(url, "organizationId") : String(body.organizationId ?? "");
      if (!organizationId) throw AiBrainError.validation("organizationId is required");
      await authorize(container, token, organizationId);

      if (request.method === "DELETE") {
        sendJson(response, 200, { data: { deleted: await container.repositories.personas.delete(personaMatch[1], organizationId) } });
        return;
      }

      const input = personaInputSchema.partial().extend({ organizationId: z.string().min(1) }).parse(body);
      const updated = await container.repositories.personas.update(personaMatch[1], organizationId, input);
      if (!updated) throw AiBrainError.notFound("Agent persona");
      sendJson(response, 200, { data: toAgentPersonaDto(updated) });
      return;
    }

    if (url.pathname === "/ai/sessions" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.sessions.listByOrganization(organizationId)).map(toAgentSessionDto) });
      return;
    }

    if (url.pathname === "/ai/runtime/metrics" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const [sessions, qualifications, decisions] = await Promise.all([
        container.repositories.sessions.listByOrganization(organizationId),
        container.repositories.qualifications.listByOrganization(organizationId),
        container.repositories.decisions.listByOrganization(organizationId, 200),
      ]);
      const [actions, followups] = await Promise.all([
        container.repositories.workflowActions.listByOrganization(organizationId),
        container.repositories.followups.listByOrganization(organizationId),
      ]);
      const activeSessions = sessions.filter((session: AgentSession) => session.status === "ACTIVE").length;
      const completedSessions = sessions.filter((session: AgentSession) => session.status === "COMPLETED").length;
      const handoffDecisions = decisions.filter((decision: AgentDecision) => decision.type === "HANDOFF").length;
      const averageConfidence = sessions.length
        ? sessions.reduce((total: number, session: AgentSession) => total + session.confidence, 0) / sessions.length
        : 0;
      const hotLeads = qualifications.filter((qualification: LeadQualification) => qualification.interestLevel === "HOT").length;
      const successfulActions = actions.filter((action) => action.status === "SUCCEEDED").length;
      const actionSuccessRate = actions.length ? successfulActions / actions.length : 0;
      const pendingFollowups = followups.filter((followup) => followup.status === "PENDING" || followup.status === "SCHEDULED").length;
      sendJson(response, 200, {
        data: { activeSessions, completedSessions, handoffDecisions, averageConfidence, hotLeads, actionSuccessRate, pendingFollowups },
      });
      return;
    }

    if ((url.pathname === "/ai/workflows" || url.pathname === "/ai/runtime/workflows") && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.workflows.listByOrganization(organizationId)).map(toWorkflowExecutionDto) });
      return;
    }

    const workflowMatch = /^\/ai\/workflows\/([^/]+)$/.exec(url.pathname);
    if (workflowMatch?.[1] && request.method === "GET") {
      const workflow = await container.repositories.workflows.findById(workflowMatch[1]);
      if (!workflow) throw AiBrainError.notFound("Workflow execution");
      await authorize(container, token, workflow.organizationId);
      sendJson(response, 200, { data: toWorkflowExecutionDto(workflow) });
      return;
    }

    if ((url.pathname === "/ai/actions" || url.pathname === "/ai/runtime/actions") && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.workflowActions.listByOrganization(organizationId)).map(toWorkflowActionDto) });
      return;
    }

    const actionMatch = /^\/ai\/actions\/([^/]+)$/.exec(url.pathname);
    if (actionMatch?.[1] && request.method === "GET") {
      const action = await container.repositories.workflowActions.findById(actionMatch[1]);
      if (!action) throw AiBrainError.notFound("Workflow action");
      await authorize(container, token, action.organizationId);
      sendJson(response, 200, { data: toWorkflowActionDto(action) });
      return;
    }

    if ((url.pathname === "/ai/followups" || url.pathname === "/ai/runtime/followups") && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.followups.listByOrganization(organizationId)).map(toScheduledFollowupDto) });
      return;
    }

    const followupCompleteMatch = /^\/ai\/followups\/([^/]+)\/complete$/.exec(url.pathname);
    if (followupCompleteMatch?.[1] && request.method === "POST") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const followup = await container.services.followupScheduler.complete(followupCompleteMatch[1], organizationId);
      if (!followup) throw AiBrainError.notFound("Scheduled follow-up");
      sendJson(response, 200, { data: toScheduledFollowupDto(followup) });
      return;
    }

    const followupMatch = /^\/ai\/followups\/([^/]+)$/.exec(url.pathname);
    if (followupMatch?.[1] && request.method === "GET") {
      const followup = await container.repositories.followups.findById(followupMatch[1]);
      if (!followup) throw AiBrainError.notFound("Scheduled follow-up");
      await authorize(container, token, followup.organizationId);
      sendJson(response, 200, { data: toScheduledFollowupDto(followup) });
      return;
    }

    if (url.pathname === "/ai/audits" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.audits.listByOrganization(organizationId)).map(toActionAuditDto) });
      return;
    }

    const auditMatch = /^\/ai\/audits\/([^/]+)$/.exec(url.pathname);
    if (auditMatch?.[1] && request.method === "GET") {
      const audit = await container.repositories.audits.findById(auditMatch[1]);
      if (!audit) throw AiBrainError.notFound("Action audit");
      await authorize(container, token, audit.organizationId);
      sendJson(response, 200, { data: toActionAuditDto(audit) });
      return;
    }

    const sessionStateMatch = /^\/ai\/sessions\/([^/]+)\/state$/.exec(url.pathname);
    if (sessionStateMatch?.[1] && request.method === "GET") {
      const session = await authorizedSession(container, token, sessionStateMatch[1]);
      const state = await container.repositories.states.findBySession(session.id);
      sendJson(response, 200, { data: state ? toConversationStateDto(state) : null });
      return;
    }

    const sessionDecisionsMatch = /^\/ai\/sessions\/([^/]+)\/decisions$/.exec(url.pathname);
    if (sessionDecisionsMatch?.[1] && request.method === "GET") {
      const session = await authorizedSession(container, token, sessionDecisionsMatch[1]);
      sendJson(response, 200, { data: (await container.repositories.decisions.listBySession(session.id)).map(toAgentDecisionDto) });
      return;
    }

    const sessionMatch = /^\/ai\/sessions\/([^/]+)$/.exec(url.pathname);
    if (sessionMatch?.[1] && request.method === "GET") {
      sendJson(response, 200, { data: toAgentSessionDto(await authorizedSession(container, token, sessionMatch[1])) });
      return;
    }

    if (url.pathname === "/ai/conversations" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.conversations.listByOrganization(organizationId)).map(toConversationDto) });
      return;
    }

    if (url.pathname === "/ai/qualifications" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.qualifications.listByOrganization(organizationId)).map(toQualificationDto) });
      return;
    }

    const conversationMessagesMatch = /^\/ai\/conversations\/([^/]+)\/messages$/.exec(url.pathname);
    if (conversationMessagesMatch?.[1] && request.method === "GET") {
      const conversation = await authorizedConversation(container, token, conversationMessagesMatch[1]);
      sendJson(response, 200, { data: (await container.repositories.messages.listByConversation(conversation.id)).map(toMessageDto) });
      return;
    }

    const conversationToolsMatch = /^\/ai\/conversations\/([^/]+)\/tools$/.exec(url.pathname);
    if (conversationToolsMatch?.[1] && request.method === "GET") {
      const conversation = await authorizedConversation(container, token, conversationToolsMatch[1]);
      sendJson(response, 200, { data: (await container.repositories.toolExecutions.listByConversation(conversation.id)).map(toToolExecutionDto) });
      return;
    }

    const conversationQualificationMatch = /^\/ai\/conversations\/([^/]+)\/qualification$/.exec(url.pathname);
    if (conversationQualificationMatch?.[1] && request.method === "GET") {
      const conversation = await authorizedConversation(container, token, conversationQualificationMatch[1]);
      const qualification = conversation.leadId ? await container.repositories.qualifications.findByLead(conversation.organizationId, conversation.leadId) : null;
      sendJson(response, 200, { data: qualification ? toQualificationDto(qualification) : null });
      return;
    }

    const conversationMatch = /^\/ai\/conversations\/([^/]+)$/.exec(url.pathname);
    if (conversationMatch?.[1] && request.method === "GET") {
      sendJson(response, 200, { data: toConversationDto(await authorizedConversation(container, token, conversationMatch[1])) });
      return;
    }

    throw AiBrainError.notFound("Route");
  } catch (error) {
    const statusCode = error instanceof AiBrainError ? error.statusCode : 500;
    sendJson(response, statusCode, {
      error: {
        code: error instanceof AiBrainError ? error.code : "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "AI Brain request failed",
      },
    });
  }
}

async function authorizedConversation(container: Container, token: string, conversationId: string) {
  const conversation = await container.repositories.conversations.findById(conversationId);
  if (!conversation) throw AiBrainError.notFound("AI conversation");
  await authorize(container, token, conversation.organizationId);
  return conversation;
}

async function authorizedSession(container: Container, token: string, sessionId: string) {
  const session = await container.repositories.sessions.findById(sessionId);
  if (!session) throw AiBrainError.notFound("Agent session");
  await authorize(container, token, session.organizationId);
  return session;
}

async function authorize(container: Container, token: string, organizationId: string): Promise<void> {
  await container.services.accessTokenService.ensureOrganizationAccess(token, organizationId);
}

function applyCors(response: ServerResponse): void {
  response.setHeader("access-control-allow-origin", env.FRONTEND_URL);
  response.setHeader("access-control-allow-credentials", "true");
  response.setHeader("access-control-allow-methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.setHeader("access-control-allow-headers", "authorization,content-type");
}

function bearerToken(request: IncomingMessage): string | null {
  const authorization = request.headers.authorization;
  return authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : null;
}

function requiredQuery(url: URL, key: string): string {
  const value = url.searchParams.get(key);
  if (!value) throw AiBrainError.validation(`${key} is required`);
  return value;
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(payload));
}
