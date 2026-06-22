export interface ExecutiveSummary {
  id: string;
  organizationId: string;
  title: string;
  summary: string;
  highlights: string[];
  risks: string[];
  recommendations: string[];
  sourceSections: string[];
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
