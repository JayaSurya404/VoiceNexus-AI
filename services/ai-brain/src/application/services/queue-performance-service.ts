import type { QueueAnalyticsRepository, QueueRepository, QueueSessionRepository } from "../ports.js";

export class QueuePerformanceService {
  constructor(
    private readonly queueAnalytics: QueueAnalyticsRepository,
    private readonly queues: QueueRepository,
    private readonly queueSessions: QueueSessionRepository,
  ) {}

  async refresh(organizationId: string) {
    const [queues, sessions] = await Promise.all([
      this.queues.listByOrganization(organizationId),
      this.queueSessions.listByOrganization(organizationId),
    ]);
    const now = new Date();

    await Promise.all(
      queues.map((queue) => {
        const queueSessions = sessions.filter((session) => session.queueId === queue.id);
        const total = queueSessions.length;
        const assigned = queueSessions.filter((session) => session.assignedAt);
        const transferred = queueSessions.filter((session) => session.status === "TRANSFERRED");
        const abandoned = queueSessions.filter((session) => session.status === "ABANDONED");
        const resolved = queueSessions.filter((session) => session.status === "COMPLETED" || session.status === "ASSIGNED");
        return this.queueAnalytics.upsert({
          organizationId,
          queueId: queue.id,
          waitTime: average(
            assigned.map((session) =>
              session.assignedAt ? Math.max(0, session.assignedAt.getTime() - session.enteredAt.getTime()) / 1000 : 0,
            ),
          ),
          abandonmentRate: ratio(abandoned.length, total),
          transferRate: ratio(transferred.length, total),
          escalationRate: ratio(queueSessions.filter((session) => session.escalationPath.length > 0).length, total),
          resolutionRate: ratio(resolved.length, total),
          sessionsHandled: total,
          computedAt: now,
        });
      }),
    );

    return this.queueAnalytics.listByOrganization(organizationId);
  }
}

function average(values: number[]): number {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

function ratio(count: number, total: number): number {
  return total ? count / total : 0;
}
