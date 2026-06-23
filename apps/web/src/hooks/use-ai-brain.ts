"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { aiBrainApi } from "@/lib/api/ai-brain-api";

export const aiBrainKeys = {
  conversations: (organizationId: string) => ["ai", "conversations", organizationId] as const,
  messages: (conversationId: string) => ["ai", "messages", conversationId] as const,
  tools: (conversationId: string) => ["ai", "tools", conversationId] as const,
  qualifications: (organizationId: string) => ["ai", "qualifications", organizationId] as const,
  personas: (organizationId: string) => ["ai", "personas", organizationId] as const,
  sessions: (organizationId: string) => ["ai", "sessions", organizationId] as const,
  sessionState: (sessionId: string) => ["ai", "session-state", sessionId] as const,
  decisions: (sessionId: string) => ["ai", "decisions", sessionId] as const,
  metrics: (organizationId: string) => ["ai", "metrics", organizationId] as const,
  workflows: (organizationId: string) => ["ai", "workflows", organizationId] as const,
  actions: (organizationId: string) => ["ai", "actions", organizationId] as const,
  followups: (organizationId: string) => ["ai", "followups", organizationId] as const,
  audits: (organizationId: string) => ["ai", "audits", organizationId] as const,
  humanAgents: (organizationId: string) => ["ai", "human-agents", organizationId] as const,
  availability: (organizationId: string) => ["ai", "agent-availability", organizationId] as const,
  queues: (organizationId: string) => ["ai", "queues", organizationId] as const,
  queueMembers: (organizationId: string) => ["ai", "queue-members", organizationId] as const,
  agentSkills: (organizationId: string) => ["ai", "agent-skills", organizationId] as const,
  queueSessions: (organizationId: string) => ["ai", "queue-sessions", organizationId] as const,
  routingDecisions: (organizationId: string) => ["ai", "routing-decisions", organizationId] as const,
  queueHealth: (organizationId: string) => ["ai", "queue-health", organizationId] as const,
  analyticsOverview: (organizationId: string) => ["ai", "analytics-overview", organizationId] as const,
  analyticsConversations: (organizationId: string) => ["ai", "analytics-conversations", organizationId] as const,
  analyticsAgents: (organizationId: string) => ["ai", "analytics-agents", organizationId] as const,
  analyticsQueues: (organizationId: string) => ["ai", "analytics-queues", organizationId] as const,
  analyticsConversions: (organizationId: string) => ["ai", "analytics-conversions", organizationId] as const,
  analyticsOutcomes: (organizationId: string) => ["ai", "analytics-outcomes", organizationId] as const,
  analyticsSentiment: (organizationId: string) => ["ai", "analytics-sentiment", organizationId] as const,
  analyticsQuality: (organizationId: string) => ["ai", "analytics-quality", organizationId] as const,
  revenueAnalytics: (organizationId: string) => ["ai", "revenue-analytics", organizationId] as const,
  revenueForecasts: (organizationId: string) => ["ai", "revenue-forecasts", organizationId] as const,
  revenueRisks: (organizationId: string) => ["ai", "revenue-risks", organizationId] as const,
  revenueOpportunities: (organizationId: string) => ["ai", "revenue-opportunities", organizationId] as const,
  revenueWinLoss: (organizationId: string) => ["ai", "revenue-win-loss", organizationId] as const,
  revenueInsights: (organizationId: string) => ["ai", "revenue-insights", organizationId] as const,
  revenueUpsell: (organizationId: string) => ["ai", "revenue-upsell", organizationId] as const,
  revenueCrossSell: (organizationId: string) => ["ai", "revenue-cross-sell", organizationId] as const,
  reportingDashboard: (organizationId: string) => ["ai", "reporting-dashboard", organizationId] as const,
  reportingKpis: (organizationId: string) => ["ai", "reporting-kpis", organizationId] as const,
  reportingTrends: (organizationId: string) => ["ai", "reporting-trends", organizationId] as const,
  reportingBenchmarks: (organizationId: string) => ["ai", "reporting-benchmarks", organizationId] as const,
  reportingInsights: (organizationId: string) => ["ai", "reporting-insights", organizationId] as const,
  reportingSummaries: (organizationId: string) => ["ai", "reporting-summaries", organizationId] as const,
  reportingTemplates: (organizationId: string) => ["ai", "reporting-templates", organizationId] as const,
  reportingGenerated: (organizationId: string) => ["ai", "reporting-generated", organizationId] as const,
  reportingExports: (organizationId: string) => ["ai", "reporting-exports", organizationId] as const,
  organizations: () => ["ai", "organizations"] as const,
  subscriptions: (organizationId: string) => ["ai", "subscriptions", organizationId] as const,
  subscriptionPlans: (organizationId: string) => ["ai", "subscription-plans", organizationId] as const,
  billingOverview: (organizationId: string) => ["ai", "billing-overview", organizationId] as const,
  billingInvoices: (organizationId: string) => ["ai", "billing-invoices", organizationId] as const,
  billingPayments: (organizationId: string) => ["ai", "billing-payments", organizationId] as const,
  apiKeys: (organizationId: string) => ["ai", "api-keys", organizationId] as const,
  auditLogs: (organizationId: string) => ["ai", "audit-logs", organizationId] as const,
  featureFlags: (organizationId: string) => ["ai", "feature-flags", organizationId] as const,
  usageRecords: (organizationId: string) => ["ai", "usage-records", organizationId] as const,
  adminOverview: (organizationId: string) => ["ai", "admin-overview", organizationId] as const,
  health: () => ["ai", "health"] as const,
  liveness: () => ["ai", "liveness"] as const,
  readiness: () => ["ai", "readiness"] as const,
  monitoringOverview: (organizationId: string) => ["ai", "monitoring-overview", organizationId] as const,
  productionMetrics: (organizationId: string) => ["ai", "production-metrics", organizationId] as const,
  systemMetrics: (organizationId: string) => ["ai", "system-metrics", organizationId] as const,
  applicationMetrics: (organizationId: string) => ["ai", "application-metrics", organizationId] as const,
  errorEvents: (organizationId: string) => ["ai", "error-events", organizationId] as const,
  errorIncidents: (organizationId: string) => ["ai", "error-incidents", organizationId] as const,
  observabilityTraces: (organizationId: string) => ["ai", "observability-traces", organizationId] as const,
  observabilityEvents: (organizationId: string) => ["ai", "observability-events", organizationId] as const,
  alertRules: (organizationId: string) => ["ai", "alert-rules", organizationId] as const,
  alertEvents: (organizationId: string) => ["ai", "alert-events", organizationId] as const,
  retryPolicies: (organizationId: string) => ["ai", "retry-policies", organizationId] as const,
  circuitBreakers: (organizationId: string) => ["ai", "circuit-breakers", organizationId] as const,
  fallbackStrategies: (organizationId: string) => ["ai", "fallback-strategies", organizationId] as const,
  distributedLocks: (organizationId: string) => ["ai", "distributed-locks", organizationId] as const,
  optimizationOverview: (organizationId: string) => ["ai", "optimization-overview", organizationId] as const,
  optimizationRules: (organizationId: string) => ["ai", "optimization-rules", organizationId] as const,
  optimizationEvents: (organizationId: string) => ["ai", "optimization-events", organizationId] as const,
  optimizationActions: (organizationId: string) => ["ai", "optimization-actions", organizationId] as const,
  optimizationRecommendations: (organizationId: string) => ["ai", "optimization-recommendations", organizationId] as const,
  optimizationMetrics: (organizationId: string) => ["ai", "optimization-metrics", organizationId] as const,
  optimizationGoals: (organizationId: string) => ["ai", "optimization-goals", organizationId] as const,
  optimizationExperiments: (organizationId: string) => ["ai", "optimization-experiments", organizationId] as const,
  optimizationResults: (organizationId: string) => ["ai", "optimization-results", organizationId] as const,
  knowledgeDocuments: (organizationId: string) => ["ai", "knowledge-documents", organizationId] as const,
  knowledgeSearches: (organizationId: string) => ["ai", "knowledge-searches", organizationId] as const,
  knowledgeCitations: (organizationId: string) => ["ai", "knowledge-citations", organizationId] as const,
  knowledgeFeedback: (organizationId: string) => ["ai", "knowledge-feedback", organizationId] as const,
  knowledgeGaps: (organizationId: string) => ["ai", "knowledge-gaps", organizationId] as const,
  knowledgeSuggestions: (organizationId: string) => ["ai", "knowledge-suggestions", organizationId] as const,
  knowledgeLearningEvents: (organizationId: string) => ["ai", "knowledge-learning-events", organizationId] as const,
  knowledgeImprovements: (organizationId: string) => ["ai", "knowledge-improvements", organizationId] as const,
  agentTeams: (organizationId: string) => ["ai", "agent-teams", organizationId] as const,
  agentTasks: (organizationId: string) => ["ai", "agent-tasks", organizationId] as const,
  agentDelegations: (organizationId: string) => ["ai", "agent-delegations", organizationId] as const,
  collaborations: (organizationId: string) => ["ai", "collaborations", organizationId] as const,
  coachingSessions: (organizationId: string) => ["ai", "coaching-sessions", organizationId] as const,
  coachingInsights: (organizationId: string) => ["ai", "coaching-insights", organizationId] as const,
  coachingMetrics: (organizationId: string) => ["ai", "coaching-metrics", organizationId] as const,
  agentRecommendations: (organizationId: string) => ["ai", "agent-recommendations", organizationId] as const,
  complianceAlerts: (organizationId: string) => ["ai", "compliance-alerts", organizationId] as const,
  conversationScorecards: (organizationId: string) => ["ai", "conversation-scorecards", organizationId] as const,
  nextBestActions: (organizationId: string) => ["ai", "next-best-actions", organizationId] as const,
  takeovers: (organizationId: string) => ["ai", "takeovers", organizationId] as const,
  whispers: (organizationId: string) => ["ai", "whispers", organizationId] as const,
  supervisorOverview: (organizationId: string) => ["ai", "supervisor-overview", organizationId] as const,
  supervisorSessions: (organizationId: string) => ["ai", "supervisor-sessions", organizationId] as const,
  assist: (sessionId: string) => ["ai", "assist", sessionId] as const,
};

export function useAiConversations(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.conversations(organizationId ?? ""),
    queryFn: () => aiBrainApi.listConversations(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useAiMessages(conversationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.messages(conversationId ?? ""),
    queryFn: () => aiBrainApi.listMessages(conversationId ?? ""),
    enabled: Boolean(conversationId),
    refetchInterval: 10_000,
  });
}

export function useAiTools(conversationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.tools(conversationId ?? ""),
    queryFn: () => aiBrainApi.listTools(conversationId ?? ""),
    enabled: Boolean(conversationId),
    refetchInterval: 10_000,
  });
}

export function useAiQualifications(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.qualifications(organizationId ?? ""),
    queryFn: () => aiBrainApi.listQualifications(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 20_000,
  });
}

export function useAgentPersonas(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.personas(organizationId ?? ""),
    queryFn: () => aiBrainApi.listPersonas(organizationId ?? ""),
    enabled: Boolean(organizationId),
  });
}

export function useAgentSessions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.sessions(organizationId ?? ""),
    queryFn: () => aiBrainApi.listSessions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useConversationState(sessionId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.sessionState(sessionId ?? ""),
    queryFn: () => aiBrainApi.getSessionState(sessionId ?? ""),
    enabled: Boolean(sessionId),
    refetchInterval: 10_000,
  });
}

export function useAgentDecisions(sessionId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.decisions(sessionId ?? ""),
    queryFn: () => aiBrainApi.listSessionDecisions(sessionId ?? ""),
    enabled: Boolean(sessionId),
    refetchInterval: 10_000,
  });
}

export function useRuntimeMetrics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.metrics(organizationId ?? ""),
    queryFn: () => aiBrainApi.runtimeMetrics(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useWorkflows(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.workflows(organizationId ?? ""),
    queryFn: () => aiBrainApi.listWorkflows(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useWorkflowActions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.actions(organizationId ?? ""),
    queryFn: () => aiBrainApi.listActions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useFollowups(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.followups(organizationId ?? ""),
    queryFn: () => aiBrainApi.listFollowups(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useActionAudits(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.audits(organizationId ?? ""),
    queryFn: () => aiBrainApi.listAudits(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 20_000,
  });
}

export function useHumanAgents(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.humanAgents(organizationId ?? ""),
    queryFn: () => aiBrainApi.listHumanAgents(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useAgentAvailability(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.availability(organizationId ?? ""),
    queryFn: () => aiBrainApi.listAvailability(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useQueues(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.queues(organizationId ?? ""),
    queryFn: () => aiBrainApi.listQueues(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useQueueMembers(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.queueMembers(organizationId ?? ""),
    queryFn: () => aiBrainApi.listQueueMembers(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 15_000,
  });
}

export function useAgentSkills(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.agentSkills(organizationId ?? ""),
    queryFn: () => aiBrainApi.listAgentSkills(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 20_000,
  });
}

export function useQueueSessions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.queueSessions(organizationId ?? ""),
    queryFn: () => aiBrainApi.listQueueSessions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useRoutingDecisions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.routingDecisions(organizationId ?? ""),
    queryFn: () => aiBrainApi.listRoutingDecisions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useQueueHealth(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.queueHealth(organizationId ?? ""),
    queryFn: () => aiBrainApi.queueHealth(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useAnalyticsOverview(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.analyticsOverview(organizationId ?? ""),
    queryFn: () => aiBrainApi.analyticsOverview(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useConversationAnalytics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.analyticsConversations(organizationId ?? ""),
    queryFn: () => aiBrainApi.analyticsConversations(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useAgentPerformanceAnalytics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.analyticsAgents(organizationId ?? ""),
    queryFn: () => aiBrainApi.analyticsAgents(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useQueueAnalytics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.analyticsQueues(organizationId ?? ""),
    queryFn: () => aiBrainApi.analyticsQueues(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useConversionAnalytics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.analyticsConversions(organizationId ?? ""),
    queryFn: () => aiBrainApi.analyticsConversions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useCallOutcomes(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.analyticsOutcomes(organizationId ?? ""),
    queryFn: () => aiBrainApi.analyticsOutcomes(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useSentimentAnalytics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.analyticsSentiment(organizationId ?? ""),
    queryFn: () => aiBrainApi.analyticsSentiment(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useQualityScores(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.analyticsQuality(organizationId ?? ""),
    queryFn: () => aiBrainApi.analyticsQuality(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useRevenueAnalytics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.revenueAnalytics(organizationId ?? ""),
    queryFn: () => aiBrainApi.revenueAnalytics(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useRevenueForecasts(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.revenueForecasts(organizationId ?? ""),
    queryFn: () => aiBrainApi.revenueForecasts(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useRevenueRisks(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.revenueRisks(organizationId ?? ""),
    queryFn: () => aiBrainApi.revenueRisks(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useRevenueOpportunities(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.revenueOpportunities(organizationId ?? ""),
    queryFn: () => aiBrainApi.revenueOpportunities(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useRevenueWinLoss(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.revenueWinLoss(organizationId ?? ""),
    queryFn: () => aiBrainApi.revenueWinLoss(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useRevenueInsights(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.revenueInsights(organizationId ?? ""),
    queryFn: () => aiBrainApi.revenueInsights(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useRevenueUpsell(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.revenueUpsell(organizationId ?? ""),
    queryFn: () => aiBrainApi.revenueUpsell(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useRevenueCrossSell(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.revenueCrossSell(organizationId ?? ""),
    queryFn: () => aiBrainApi.revenueCrossSell(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useReportingDashboard(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.reportingDashboard(organizationId ?? ""),
    queryFn: () => aiBrainApi.reportingDashboard(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useReportingKpis(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.reportingKpis(organizationId ?? ""),
    queryFn: () => aiBrainApi.reportingKpis(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useReportingTrends(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.reportingTrends(organizationId ?? ""),
    queryFn: () => aiBrainApi.reportingTrends(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useReportingBenchmarks(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.reportingBenchmarks(organizationId ?? ""),
    queryFn: () => aiBrainApi.reportingBenchmarks(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useReportingInsights(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.reportingInsights(organizationId ?? ""),
    queryFn: () => aiBrainApi.reportingInsights(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useReportingSummaries(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.reportingSummaries(organizationId ?? ""),
    queryFn: () => aiBrainApi.reportingSummaries(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useReportingTemplates(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.reportingTemplates(organizationId ?? ""),
    queryFn: () => aiBrainApi.reportingTemplates(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useReportingGenerated(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.reportingGenerated(organizationId ?? ""),
    queryFn: () => aiBrainApi.reportingGenerated(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useReportingExports(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.reportingExports(organizationId ?? ""),
    queryFn: () => aiBrainApi.reportingExports(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useOptimizationOverview(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.optimizationOverview(organizationId ?? ""),
    queryFn: () => aiBrainApi.optimizationOverview(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useOptimizationRules(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.optimizationRules(organizationId ?? ""),
    queryFn: () => aiBrainApi.optimizationRules(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useOptimizationEvents(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.optimizationEvents(organizationId ?? ""),
    queryFn: () => aiBrainApi.optimizationEvents(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useOptimizationActions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.optimizationActions(organizationId ?? ""),
    queryFn: () => aiBrainApi.optimizationActions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useOptimizationRecommendations(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.optimizationRecommendations(organizationId ?? ""),
    queryFn: () => aiBrainApi.optimizationRecommendations(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useOptimizationMetrics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.optimizationMetrics(organizationId ?? ""),
    queryFn: () => aiBrainApi.optimizationMetrics(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useOptimizationGoals(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.optimizationGoals(organizationId ?? ""),
    queryFn: () => aiBrainApi.optimizationGoals(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useOptimizationExperiments(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.optimizationExperiments(organizationId ?? ""),
    queryFn: () => aiBrainApi.optimizationExperiments(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useOptimizationResults(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.optimizationResults(organizationId ?? ""),
    queryFn: () => aiBrainApi.optimizationResults(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: aiBrainKeys.organizations(),
    queryFn: () => aiBrainApi.organizations(),
  });
}

export function useSubscriptions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.subscriptions(organizationId ?? ""),
    queryFn: () => aiBrainApi.subscriptions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useSubscriptionPlans(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.subscriptionPlans(organizationId ?? ""),
    queryFn: () => aiBrainApi.subscriptionPlans(organizationId),
    refetchInterval: 60_000,
  });
}

export function useBillingOverview(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.billingOverview(organizationId ?? ""),
    queryFn: () => aiBrainApi.billingOverview(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useBillingInvoices(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.billingInvoices(organizationId ?? ""),
    queryFn: () => aiBrainApi.billingInvoices(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useBillingPayments(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.billingPayments(organizationId ?? ""),
    queryFn: () => aiBrainApi.billingPayments(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useApiKeys(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.apiKeys(organizationId ?? ""),
    queryFn: () => aiBrainApi.apiKeys(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useAuditLogs(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.auditLogs(organizationId ?? ""),
    queryFn: () => aiBrainApi.auditLogs(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useFeatureFlags(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.featureFlags(organizationId ?? ""),
    queryFn: () => aiBrainApi.featureFlags(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useUsageRecords(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.usageRecords(organizationId ?? ""),
    queryFn: () => aiBrainApi.usageRecords(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useAdminOverview(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.adminOverview(organizationId ?? ""),
    queryFn: () => aiBrainApi.adminOverview(organizationId),
    refetchInterval: 30_000,
  });
}

export function useHealthStatus() {
  return useQuery({
    queryKey: aiBrainKeys.health(),
    queryFn: () => aiBrainApi.health(),
    refetchInterval: 15_000,
  });
}

export function useLivenessStatus() {
  return useQuery({
    queryKey: aiBrainKeys.liveness(),
    queryFn: () => aiBrainApi.liveness(),
    refetchInterval: 15_000,
  });
}

export function useReadinessStatus() {
  return useQuery({
    queryKey: aiBrainKeys.readiness(),
    queryFn: () => aiBrainApi.readiness(),
    refetchInterval: 15_000,
  });
}

export function useMonitoringOverview(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.monitoringOverview(organizationId ?? ""),
    queryFn: () => aiBrainApi.monitoringOverview(organizationId),
    refetchInterval: 15_000,
  });
}

export function useProductionMetrics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.productionMetrics(organizationId ?? ""),
    queryFn: () => aiBrainApi.metrics(organizationId),
    refetchInterval: 15_000,
  });
}

export function useSystemMetrics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.systemMetrics(organizationId ?? ""),
    queryFn: () => aiBrainApi.systemMetrics(organizationId),
    refetchInterval: 15_000,
  });
}

export function useApplicationMetrics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.applicationMetrics(organizationId ?? ""),
    queryFn: () => aiBrainApi.applicationMetrics(organizationId),
    refetchInterval: 15_000,
  });
}

export function useErrorEvents(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.errorEvents(organizationId ?? ""),
    queryFn: () => aiBrainApi.errorEvents(organizationId),
    refetchInterval: 20_000,
  });
}

export function useErrorIncidents(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.errorIncidents(organizationId ?? ""),
    queryFn: () => aiBrainApi.errorIncidents(organizationId),
    refetchInterval: 20_000,
  });
}

export function useObservabilityTraces(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.observabilityTraces(organizationId ?? ""),
    queryFn: () => aiBrainApi.observabilityTraces(organizationId),
    refetchInterval: 20_000,
  });
}

export function useObservabilityEvents(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.observabilityEvents(organizationId ?? ""),
    queryFn: () => aiBrainApi.observabilityEvents(organizationId),
    refetchInterval: 20_000,
  });
}

export function useAlertRules(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.alertRules(organizationId ?? ""),
    queryFn: () => aiBrainApi.alertRules(organizationId),
    refetchInterval: 30_000,
  });
}

export function useAlertEvents(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.alertEvents(organizationId ?? ""),
    queryFn: () => aiBrainApi.alertEvents(organizationId),
    refetchInterval: 20_000,
  });
}

export function useRetryPolicies(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.retryPolicies(organizationId ?? ""),
    queryFn: () => aiBrainApi.retryPolicies(organizationId),
    refetchInterval: 30_000,
  });
}

export function useCircuitBreakers(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.circuitBreakers(organizationId ?? ""),
    queryFn: () => aiBrainApi.circuitBreakers(organizationId),
    refetchInterval: 20_000,
  });
}

export function useFallbackStrategies(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.fallbackStrategies(organizationId ?? ""),
    queryFn: () => aiBrainApi.fallbackStrategies(organizationId),
    refetchInterval: 30_000,
  });
}

export function useDistributedLocks(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.distributedLocks(organizationId ?? ""),
    queryFn: () => aiBrainApi.distributedLocks(organizationId),
    refetchInterval: 20_000,
  });
}

export function useKnowledgeDocuments(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.knowledgeDocuments(organizationId ?? ""),
    queryFn: () => aiBrainApi.listKnowledgeDocuments(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useKnowledgeSearches(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.knowledgeSearches(organizationId ?? ""),
    queryFn: () => aiBrainApi.listKnowledgeSearches(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useKnowledgeCitations(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.knowledgeCitations(organizationId ?? ""),
    queryFn: () => aiBrainApi.listKnowledgeCitations(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useKnowledgeFeedback(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.knowledgeFeedback(organizationId ?? ""),
    queryFn: () => aiBrainApi.listKnowledgeFeedback(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useKnowledgeGaps(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.knowledgeGaps(organizationId ?? ""),
    queryFn: () => aiBrainApi.listKnowledgeGaps(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useKnowledgeSuggestions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.knowledgeSuggestions(organizationId ?? ""),
    queryFn: () => aiBrainApi.listKnowledgeSuggestions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useKnowledgeLearningEvents(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.knowledgeLearningEvents(organizationId ?? ""),
    queryFn: () => aiBrainApi.listKnowledgeLearningEvents(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useKnowledgeImprovements(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.knowledgeImprovements(organizationId ?? ""),
    queryFn: () => aiBrainApi.listKnowledgeImprovements(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useAgentTeams(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.agentTeams(organizationId ?? ""),
    queryFn: () => aiBrainApi.listAgentTeams(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useCollaborativeAgentTasks(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.agentTasks(organizationId ?? ""),
    queryFn: () => aiBrainApi.listAgentTasks(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useAgentDelegations(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.agentDelegations(organizationId ?? ""),
    queryFn: () => aiBrainApi.listAgentDelegations(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useCollaborations(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.collaborations(organizationId ?? ""),
    queryFn: () => aiBrainApi.listCollaborations(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useCoachingSessions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.coachingSessions(organizationId ?? ""),
    queryFn: () => aiBrainApi.listCoachingSessions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useCoachingInsights(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.coachingInsights(organizationId ?? ""),
    queryFn: () => aiBrainApi.listCoachingInsights(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useCoachingMetrics(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.coachingMetrics(organizationId ?? ""),
    queryFn: () => aiBrainApi.coachingMetrics(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 30_000,
  });
}

export function useAgentRecommendations(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.agentRecommendations(organizationId ?? ""),
    queryFn: () => aiBrainApi.listAgentRecommendations(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useComplianceAlerts(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.complianceAlerts(organizationId ?? ""),
    queryFn: () => aiBrainApi.listComplianceAlerts(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useConversationScorecards(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.conversationScorecards(organizationId ?? ""),
    queryFn: () => aiBrainApi.listConversationScorecards(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 20_000,
  });
}

export function useNextBestActions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.nextBestActions(organizationId ?? ""),
    queryFn: () => aiBrainApi.listNextBestActions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useKnowledgeActions(organizationId: string | null) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    if (!organizationId) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.knowledgeDocuments(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.knowledgeSearches(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.knowledgeCitations(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.knowledgeFeedback(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.knowledgeGaps(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.knowledgeSuggestions(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.knowledgeLearningEvents(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.knowledgeImprovements(organizationId) }),
    ]);
  };

  return {
    upload: useMutation({
      mutationFn: (input: {
        title: string;
        sourceName: string;
        documentType: "PDF" | "DOCX" | "TXT" | "MARKDOWN";
        content: string;
        encoding?: "text" | "base64";
        knowledgeBaseId?: string | null;
        uploadedBy?: string | null;
        metadata?: Record<string, unknown>;
      }) => aiBrainApi.uploadKnowledge({ organizationId: organizationId ?? "", ...input }),
      onSuccess: invalidate,
    }),
    search: useMutation({
      mutationFn: (input: {
        query: string;
        transcript?: string | null;
        crmContext?: Record<string, unknown>;
        memoryContext?: Record<string, unknown>;
        conversationId?: string | null;
        agentSessionId?: string | null;
      }) => aiBrainApi.searchKnowledge({ organizationId: organizationId ?? "", ...input }),
      onSuccess: invalidate,
    }),
    deleteDocument: useMutation({
      mutationFn: (id: string) => aiBrainApi.deleteKnowledgeDocument(id, organizationId ?? ""),
      onSuccess: invalidate,
    }),
    createFeedback: useMutation({
      mutationFn: (input: {
        searchId?: string | null;
        citationId?: string | null;
        conversationId?: string | null;
        agentSessionId?: string | null;
        chunkId?: string | null;
        type: "HELPFUL" | "UNHELPFUL" | "ESCALATED_CALL" | "HUMAN_TAKEOVER" | "LOW_CONFIDENCE_RESPONSE" | "FAILED_SEARCH";
        retrievalUsage: "RETRIEVED" | "USED" | "IGNORED" | "HELPFUL" | "UNHELPFUL";
        rating?: number | null;
        comment?: string | null;
        createdBy?: string | null;
      }) => aiBrainApi.createKnowledgeFeedback({ organizationId: organizationId ?? "", ...input }),
      onSuccess: invalidate,
    }),
    approveSuggestion: useMutation({
      mutationFn: (input: { id: string; reviewedBy?: string | null }) =>
        aiBrainApi.approveKnowledgeSuggestion(input.id, organizationId ?? "", input.reviewedBy),
      onSuccess: invalidate,
    }),
    rejectSuggestion: useMutation({
      mutationFn: (input: { id: string; reviewedBy?: string | null }) =>
        aiBrainApi.rejectKnowledgeSuggestion(input.id, organizationId ?? "", input.reviewedBy),
      onSuccess: invalidate,
    }),
  };
}

export function useLiveTakeovers(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.takeovers(organizationId ?? ""),
    queryFn: () => aiBrainApi.listTakeovers(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useWhispers(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.whispers(organizationId ?? ""),
    queryFn: () => aiBrainApi.listWhispers(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useSupervisorOverview(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.supervisorOverview(organizationId ?? ""),
    queryFn: () => aiBrainApi.supervisorOverview(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useSupervisorSessions(organizationId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.supervisorSessions(organizationId ?? ""),
    queryFn: () => aiBrainApi.supervisorSessions(organizationId ?? ""),
    enabled: Boolean(organizationId),
    refetchInterval: 10_000,
  });
}

export function useAgentAssist(sessionId: string | null) {
  return useQuery({
    queryKey: aiBrainKeys.assist(sessionId ?? ""),
    queryFn: () => aiBrainApi.agentAssist(sessionId ?? ""),
    enabled: Boolean(sessionId),
    refetchInterval: 20_000,
  });
}

export function useHumanConsoleActions(organizationId: string | null) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    if (!organizationId) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.humanAgents(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.availability(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.queues(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.queueSessions(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.routingDecisions(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.queueHealth(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.takeovers(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.whispers(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.supervisorSessions(organizationId) }),
      queryClient.invalidateQueries({ queryKey: aiBrainKeys.supervisorOverview(organizationId) }),
    ]);
  };

  return {
    joinSession: useMutation({
      mutationFn: (input: { agentId: string; aiSessionId?: string | null; callId?: string | null; leadId?: string | null }) =>
        aiBrainApi.joinAgentSession(input.agentId, {
          organizationId: organizationId ?? "",
          aiSessionId: input.aiSessionId,
          callId: input.callId,
          leadId: input.leadId,
        }),
      onSuccess: invalidate,
    }),
    createTakeover: useMutation({
      mutationFn: (input: { sessionId: string; agentId: string; reason: string }) =>
        aiBrainApi.createTakeover({ organizationId: organizationId ?? "", ...input }),
      onSuccess: invalidate,
    }),
    startTakeover: useMutation({
      mutationFn: (id: string) => aiBrainApi.startTakeover(id),
      onSuccess: invalidate,
    }),
    endTakeover: useMutation({
      mutationFn: (id: string) => aiBrainApi.endTakeover(id),
      onSuccess: invalidate,
    }),
    createWhisper: useMutation({
      mutationFn: (input: {
        sessionId: string;
        senderId: string;
        senderRole: "SUPERVISOR" | "AGENT";
        target: "AGENT" | "AI";
        targetAgentId?: string | null;
        content: string;
      }) => aiBrainApi.createWhisper({ organizationId: organizationId ?? "", ...input }),
      onSuccess: invalidate,
    }),
  };
}
