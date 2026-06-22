export interface ConversationScorecard {
  id: string;
  organizationId: string;
  coachingSessionId: string | null;
  agentId: string | null;
  conversationId: string | null;
  discoveryQuality: number;
  qualificationQuality: number;
  objectionHandlingQuality: number;
  complianceScore: number;
  closingEffectiveness: number;
  overallScore: number;
  reasoning: string;
  createdAt: Date;
  updatedAt: Date;
}
