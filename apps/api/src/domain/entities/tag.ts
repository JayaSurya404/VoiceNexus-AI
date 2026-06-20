export interface Tag {
  id: string;
  organizationId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewTag {
  organizationId: string;
  name: string;
  color: string;
}
