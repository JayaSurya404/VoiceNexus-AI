export interface MemoryTag {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewMemoryTag {
  organizationId: string;
  name: string;
  description: string;
}
