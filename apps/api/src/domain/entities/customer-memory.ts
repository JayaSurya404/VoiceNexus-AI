export interface CustomerMemory {
  id: string;
  organizationId: string;
  leadId: string;
  summary: string;
  relationshipScore: number;
  lastInteractionAt: Date | null;
  memoryTags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NewCustomerMemory {
  organizationId: string;
  leadId: string;
  summary: string;
  relationshipScore: number;
  lastInteractionAt: Date | null;
  memoryTags: string[];
}
