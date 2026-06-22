export interface DealStage {
  id: string;
  organizationId: string;
  name: string;
  order: number;
  probability: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
