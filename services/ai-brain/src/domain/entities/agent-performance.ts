export interface AgentPerformance {
  id: string;
  organizationId: string;
  agentId: string;
  callsHandled: number;
  averageDuration: number;
  averageQaScore: number;
  averageSentiment: number;
  transfers: number;
  conversions: number;
  leadQuality: number;
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
