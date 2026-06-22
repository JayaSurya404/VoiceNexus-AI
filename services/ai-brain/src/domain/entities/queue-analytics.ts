export interface QueueAnalytics {
  id: string;
  organizationId: string;
  queueId: string;
  waitTime: number;
  abandonmentRate: number;
  transferRate: number;
  escalationRate: number;
  resolutionRate: number;
  sessionsHandled: number;
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
