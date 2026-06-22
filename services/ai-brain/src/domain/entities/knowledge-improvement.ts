export interface KnowledgeImprovement {
  id: string;
  organizationId: string;
  knowledgeQualityScore: number;
  coverageScore: number;
  retrievalSuccessRate: number;
  gapSeverityScore: number;
  feedbackCount: number;
  openGapCount: number;
  suggestionCount: number;
  computedAt: Date;
  createdAt: Date;
}
