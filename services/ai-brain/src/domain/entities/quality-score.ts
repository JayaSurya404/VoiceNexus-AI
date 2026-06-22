export interface QualityScore {
  id: string;
  organizationId: string;
  conversationId: string;
  agentSessionId: string | null;
  greetingQuality: number;
  discoveryQuality: number;
  qualificationQuality: number;
  objectionHandling: number;
  complianceScore: number;
  closingQuality: number;
  overallScore: number;
  reasoning: string;
  createdAt: Date;
  updatedAt: Date;
}
