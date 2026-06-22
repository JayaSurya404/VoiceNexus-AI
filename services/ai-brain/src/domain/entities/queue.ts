export interface Queue {
  id: string;
  organizationId: string;
  name: string;
  priority: number;
  maxWaitingTime: number;
  overflowQueueId: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
