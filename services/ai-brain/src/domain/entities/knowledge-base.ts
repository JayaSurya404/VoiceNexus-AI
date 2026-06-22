export interface KnowledgeBase {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  active: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
