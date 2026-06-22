import type {
  AgentAvailabilityRepository,
  AgentSkillRepository,
  HumanAgentRepository,
  QueueHealth,
  QueueMemberRepository,
  QueueRepository,
  QueueSessionRepository,
  RoutingDecisionRepository,
  RoutingRuleRepository,
} from "../ports.js";
import type { Agent } from "../../domain/entities/agent.js";
import type { AgentAvailability } from "../../domain/entities/agent-availability.js";
import type { AgentSkill } from "../../domain/entities/agent-skill.js";
import type { Queue } from "../../domain/entities/queue.js";
import type { QueueSession, QueueSessionSource } from "../../domain/entities/queue-session.js";
import type { RoutingDecision } from "../../domain/entities/routing-decision.js";
import type { RoutingRule } from "../../domain/entities/routing-rule.js";
import type { HumanConsoleEventService } from "./human-console-event-service.js";

export interface RoutingAssignInput {
  organizationId: string;
  queueSessionId?: string | null;
  queueId?: string | null;
  callId?: string | null;
  aiSessionId?: string | null;
  leadId?: string | null;
  source?: QueueSessionSource;
  requiredSkills?: string[];
  priority?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface RoutingAssignResult {
  queueSession: QueueSession | null;
  queue: Queue | null;
  agent: Agent | null;
  decision: RoutingDecision;
  escalationPath: Queue[];
}

interface AgentScore {
  agent: Agent;
  availability: AgentAvailability;
  score: number;
  skillScore: number;
  loadScore: number;
}

export class RoutingEngineService {
  constructor(
    private readonly queues: QueueRepository,
    private readonly queueMembers: QueueMemberRepository,
    private readonly rules: RoutingRuleRepository,
    private readonly routingDecisions: RoutingDecisionRepository,
    private readonly queueSessions: QueueSessionRepository,
    private readonly agentSkills: AgentSkillRepository,
    private readonly agents: HumanAgentRepository,
    private readonly availability: AgentAvailabilityRepository,
    private readonly events: HumanConsoleEventService,
  ) {}

  async createQueue(input: Parameters<QueueRepository["create"]>[0]): Promise<Queue> {
    const queue = await this.queues.create(input);
    await this.events.publish("queue.created", {
      organizationId: queue.organizationId,
      payload: { queueId: queue.id, name: queue.name, priority: queue.priority },
    });
    return queue;
  }

  async ensureDefaultQueues(organizationId: string): Promise<Queue[]> {
    const existing = await this.queues.listByOrganization(organizationId);
    if (existing.length) return existing;

    await Promise.all([
      this.createQueue({
        organizationId,
        name: "Sales Queue",
        priority: 80,
        maxWaitingTime: 300,
        overflowQueueId: null,
        active: true,
      }),
      this.createQueue({
        organizationId,
        name: "Support Queue",
        priority: 70,
        maxWaitingTime: 240,
        overflowQueueId: null,
        active: true,
      }),
      this.createQueue({
        organizationId,
        name: "Billing Queue",
        priority: 60,
        maxWaitingTime: 240,
        overflowQueueId: null,
        active: true,
      }),
    ]);
    return this.queues.listByOrganization(organizationId);
  }

  async updateQueue(
    id: string,
    organizationId: string,
    input: Parameters<QueueRepository["update"]>[2],
  ): Promise<Queue | null> {
    const queue = await this.queues.update(id, organizationId, input);
    if (queue) {
      await this.events.publish("queue.updated", {
        organizationId,
        payload: { queueId: queue.id, name: queue.name, active: queue.active },
      });
    }
    return queue;
  }

  async assign(input: RoutingAssignInput): Promise<RoutingAssignResult> {
    const now = new Date();
    const decisionPath: string[] = ["routing.started"];
    const activeQueues = (await this.queues.listByOrganization(input.organizationId)).filter((queue) => queue.active);
    const routingRules = (await this.rules.listByOrganization(input.organizationId)).filter((rule) => rule.active);
    const skills = normalizeSkills(input.requiredSkills ?? []);
    const matchedRule = matchRule(routingRules, input, skills);
    const selectedQueue = selectQueue(activeQueues, input.queueId ?? matchedRule?.targetQueueId ?? null, skills);

    if (!selectedQueue) {
      decisionPath.push("queue.not_found");
      return this.fail(input, null, null, "No active queue matched the routing request.", decisionPath);
    }

    decisionPath.push(`queue.selected:${selectedQueue.name}`);

    const queueSession =
      input.queueSessionId
        ? await this.queueSessions.update(input.queueSessionId, input.organizationId, {
            queueId: selectedQueue.id,
            priority: input.priority ?? selectedQueue.priority,
            status: "WAITING",
            routingReason: input.reason ?? matchedRule?.name ?? "Routing assignment requested",
          })
        : await this.queueSessions.create({
            organizationId: input.organizationId,
            queueId: selectedQueue.id,
            callId: input.callId ?? null,
            aiSessionId: input.aiSessionId ?? null,
            leadId: input.leadId ?? null,
            assignedAgentId: null,
            priority: input.priority ?? selectedQueue.priority,
            status: "WAITING",
            source: input.source ?? "AI",
            routingReason: input.reason ?? matchedRule?.name ?? "Routing assignment requested",
            escalationPath: [],
            enteredAt: now,
            assignedAt: null,
            completedAt: null,
            abandonedAt: null,
          });

    if (!queueSession) {
      decisionPath.push("queue_session.update_failed");
      return this.fail(input, selectedQueue, null, "Queue session could not be created or updated.", decisionPath);
    }

    if (!input.queueSessionId) {
      await this.events.publish("queue.session.created", {
        organizationId: input.organizationId,
        sessionId: queueSession.id,
        payload: { queueSessionId: queueSession.id, queueId: selectedQueue.id, callId: queueSession.callId },
      });
    }

    const escalationPath = await this.resolveEscalationPath(input.organizationId, selectedQueue, matchedRule);
    const requiredSkills = skills.length ? skills : normalizeSkills(matchedRule?.requiredSkills ?? []);
    const bestAgent = await this.bestAgent(input.organizationId, selectedQueue.id, requiredSkills, decisionPath);

    if (!bestAgent) {
      const escalated = await this.escalateQueueSession(input.organizationId, queueSession, selectedQueue, escalationPath, decisionPath);
      return this.complete(input, escalated, selectedQueue, null, escalationPath, 0.45, decisionPath, "No available skilled agent. Session waiting or escalated.");
    }

    const assigned = await this.queueSessions.update(queueSession.id, input.organizationId, {
      assignedAgentId: bestAgent.agent.id,
      status: "ASSIGNED",
      routingReason: input.reason ?? `Assigned by skill and workload score ${bestAgent.score.toFixed(2)}`,
      escalationPath: escalationPath.map((queue) => queue.id),
      assignedAt: now,
    });

    if (assigned) {
      await this.events.publish("queue.session.assigned", {
        organizationId: input.organizationId,
        sessionId: assigned.id,
        payload: {
          queueSessionId: assigned.id,
          queueId: selectedQueue.id,
          agentId: bestAgent.agent.id,
          reason: assigned.routingReason,
        },
      });
    }

    return this.complete(
      input,
      assigned ?? queueSession,
      selectedQueue,
      bestAgent.agent,
      escalationPath,
      confidenceFor(bestAgent),
      decisionPath,
      `Selected ${bestAgent.agent.name} for ${selectedQueue.name}.`,
    );
  }

  async escalateToAgent(input: RoutingAssignInput): Promise<RoutingAssignResult> {
    return this.assign({ ...input, source: "AI", reason: input.reason ?? "AI to agent escalation requested" });
  }

  async escalateToSupervisor(organizationId: string, queueSessionId: string, reason: string): Promise<QueueSession | null> {
    const session = await this.queueSessions.findById(queueSessionId);
    if (!session || session.organizationId !== organizationId) return null;
    const updated = await this.queueSessions.update(queueSessionId, organizationId, {
      status: "TRANSFERRED",
      routingReason: reason,
      escalationPath: session.escalationPath,
    });
    await this.events.publish("escalation.started", {
      organizationId,
      sessionId: queueSessionId,
      payload: { queueSessionId, type: "AGENT_TO_SUPERVISOR", reason },
    });
    return updated;
  }

  async transferQueue(
    organizationId: string,
    queueSessionId: string,
    targetQueueId: string,
    reason: string,
  ): Promise<QueueSession | null> {
    const session = await this.queueSessions.findById(queueSessionId);
    if (!session || session.organizationId !== organizationId) return null;
    const updated = await this.queueSessions.update(queueSessionId, organizationId, {
      queueId: targetQueueId,
      assignedAgentId: null,
      status: "TRANSFERRED",
      routingReason: reason,
      escalationPath: [...session.escalationPath, targetQueueId],
    });
    await this.events.publish("escalation.started", {
      organizationId,
      sessionId: queueSessionId,
      payload: { queueSessionId, type: "QUEUE_TO_QUEUE", targetQueueId, reason },
    });
    return updated;
  }

  async queueHealth(organizationId: string): Promise<QueueHealth[]> {
    const queues = await this.ensureDefaultQueues(organizationId);
    const [sessions, members, availability] = await Promise.all([
      this.queueSessions.listByOrganization(organizationId),
      this.queueMembers.listByOrganization(organizationId),
      this.availability.listByOrganization(organizationId),
    ]);
    const now = Date.now();
    return queues.map((queue) => {
      const queueSessions = sessions.filter((session) => session.queueId === queue.id);
      const waiting = queueSessions.filter((session) => session.status === "WAITING");
      const waits = waiting.map((session) => Math.max(0, now - session.enteredAt.getTime()) / 1000);
      const activeAgentIds = new Set(
        members
          .filter((member) => member.queueId === queue.id && member.active)
          .map((member) => member.agentId)
          .filter((agentId) =>
            availability.some((item) => item.agentId === agentId && (item.status === "AVAILABLE" || item.status === "BUSY")),
          ),
      );

      return {
        queueId: queue.id,
        queueName: queue.name,
        waiting: waiting.length,
        assigned: queueSessions.filter((session) => session.status === "ASSIGNED").length,
        averageWaitTime: waits.length ? waits.reduce((total, wait) => total + wait, 0) / waits.length : 0,
        longestWaitTime: waits.length ? Math.max(...waits) : 0,
        activeAgents: activeAgentIds.size,
        priority: queue.priority,
      };
    });
  }

  private async bestAgent(
    organizationId: string,
    queueId: string,
    requiredSkills: string[],
    decisionPath: string[],
  ): Promise<AgentScore | null> {
    const [agents, availability, members, skills] = await Promise.all([
      this.agents.listByOrganization(organizationId),
      this.availability.listByOrganization(organizationId),
      this.queueMembers.listByQueue(organizationId, queueId),
      this.agentSkills.listByOrganization(organizationId),
    ]);
    const activeMemberAgentIds = new Set(members.filter((member) => member.active).map((member) => member.agentId));
    const candidates = agents.filter((agent) => activeMemberAgentIds.has(agent.id) && agent.status !== "OFFLINE");
    decisionPath.push(`agents.candidates:${candidates.length}`);

    const scores = candidates
      .map((agent) => scoreAgent(agent, availability, skills, requiredSkills))
      .filter((score): score is AgentScore => Boolean(score));

    let best: AgentScore | null = null;
    for (const score of scores) {
      if (!best || score.score > best.score) best = score;
    }

    if (!best) {
      decisionPath.push("agents.none_available");
      return null;
    }

    decisionPath.push(`agent.selected:${best.agent.id}`);
    decisionPath.push(`agent.skill_score:${best.skillScore.toFixed(2)}`);
    decisionPath.push(`agent.load_score:${best.loadScore.toFixed(2)}`);
    return best;
  }

  private async resolveEscalationPath(
    organizationId: string,
    queue: Queue,
    rule: RoutingRule | null,
  ): Promise<Queue[]> {
    const ids = [rule?.escalationQueueId, queue.overflowQueueId].filter((value): value is string => Boolean(value));
    const queues = await Promise.all(ids.map((id) => this.queues.findById(id)));
    return queues.filter((item): item is Queue => Boolean(item && item.organizationId === organizationId && item.active));
  }

  private async escalateQueueSession(
    organizationId: string,
    queueSession: QueueSession,
    queue: Queue,
    escalationPath: Queue[],
    decisionPath: string[],
  ): Promise<QueueSession> {
    const targetQueue = escalationPath[0];
    if (!targetQueue) return queueSession;

    decisionPath.push(`queue.escalated:${targetQueue.name}`);
    const updated = await this.queueSessions.update(queueSession.id, organizationId, {
      queueId: targetQueue.id,
      status: "TRANSFERRED",
      routingReason: `Overflow from ${queue.name} to ${targetQueue.name}`,
      escalationPath: escalationPath.map((item) => item.id),
    });
    await this.events.publish("escalation.started", {
      organizationId,
      sessionId: queueSession.id,
      payload: { queueSessionId: queueSession.id, type: "QUEUE_TO_QUEUE", fromQueueId: queue.id, targetQueueId: targetQueue.id },
    });
    return updated ?? queueSession;
  }

  private async complete(
    input: RoutingAssignInput,
    queueSession: QueueSession | null,
    queue: Queue | null,
    agent: Agent | null,
    escalationPath: Queue[],
    confidence: number,
    decisionPath: string[],
    reason: string,
  ): Promise<RoutingAssignResult> {
    const decision = await this.routingDecisions.create({
      organizationId: input.organizationId,
      queueSessionId: queueSession?.id ?? null,
      queueId: queue?.id ?? null,
      agentId: agent?.id ?? null,
      escalationQueueId: escalationPath[0]?.id ?? null,
      status: "COMPLETED",
      reason,
      confidence,
      inputs: sanitizeInputs(input),
      decisionPath,
      createdAt: new Date(),
    });
    await this.events.publish("routing.completed", {
      organizationId: input.organizationId,
      sessionId: queueSession?.id ?? null,
      payload: { decisionId: decision.id, queueId: queue?.id ?? null, agentId: agent?.id ?? null, confidence },
    });
    return { queueSession, queue, agent, decision, escalationPath };
  }

  private async fail(
    input: RoutingAssignInput,
    queue: Queue | null,
    queueSession: QueueSession | null,
    reason: string,
    decisionPath: string[],
  ): Promise<RoutingAssignResult> {
    const decision = await this.routingDecisions.create({
      organizationId: input.organizationId,
      queueSessionId: queueSession?.id ?? null,
      queueId: queue?.id ?? null,
      agentId: null,
      escalationQueueId: null,
      status: "FAILED",
      reason,
      confidence: 0,
      inputs: sanitizeInputs(input),
      decisionPath,
      createdAt: new Date(),
    });
    await this.events.publish("routing.failed", {
      organizationId: input.organizationId,
      sessionId: queueSession?.id ?? null,
      payload: { decisionId: decision.id, reason },
    });
    return { queueSession, queue, agent: null, decision, escalationPath: [] };
  }
}

function normalizeSkills(skills: string[]): string[] {
  return skills.map((skill) => skill.trim().toUpperCase()).filter(Boolean);
}

function matchRule(rules: RoutingRule[], input: RoutingAssignInput, skills: string[]): RoutingRule | null {
  return (
    rules
      .filter((rule) => {
        const ruleSkills = normalizeSkills(rule.requiredSkills);
        return !ruleSkills.length || ruleSkills.some((skill) => skills.includes(skill));
      })
      .sort((left, right) => right.priority - left.priority)[0] ?? null
  );
}

function selectQueue(queues: Queue[], queueId: string | null, skills: string[]): Queue | null {
  if (queueId) return queues.find((queue) => queue.id === queueId) ?? null;
  const preferred = queues.find((queue) => skills.some((skill) => queue.name.toUpperCase().includes(skill)));
  return preferred ?? queues.sort((left, right) => right.priority - left.priority)[0] ?? null;
}

function scoreAgent(
  agent: Agent,
  availability: AgentAvailability[],
  skills: AgentSkill[],
  requiredSkills: string[],
): AgentScore | null {
  const current = availability.find((item) => item.agentId === agent.id);
  if (!current || current.status !== "AVAILABLE" || current.activeSessionCount >= current.capacity) return null;

  const agentSkills = skills.filter((skill) => skill.agentId === agent.id && skill.active);
  const explicitSkillScore = requiredSkills.length
    ? requiredSkills.reduce((total, required) => {
        const skill = agentSkills.find((item) => item.skill.toUpperCase() === required);
        return total + (skill ? skill.level / 5 + (skill.certified ? 0.25 : 0) : 0);
      }, 0) / requiredSkills.length
    : 0.75;
  const legacySkillScore = requiredSkills.some((required) => agent.skills.map((skill) => skill.toUpperCase()).includes(required)) ? 0.6 : 0;
  const skillScore = Math.min(1, Math.max(explicitSkillScore, legacySkillScore));
  if (requiredSkills.length && skillScore <= 0) return null;

  const loadScore = 1 - current.activeSessionCount / current.capacity;
  return {
    agent,
    availability: current,
    skillScore,
    loadScore,
    score: skillScore * 0.65 + loadScore * 0.35,
  };
}

function confidenceFor(score: AgentScore): number {
  return Math.max(0.5, Math.min(0.99, score.score));
}

function sanitizeInputs(input: RoutingAssignInput): Record<string, unknown> {
  return {
    queueSessionId: input.queueSessionId ?? null,
    queueId: input.queueId ?? null,
    callId: input.callId ?? null,
    aiSessionId: input.aiSessionId ?? null,
    leadId: input.leadId ?? null,
    source: input.source ?? "AI",
    requiredSkills: input.requiredSkills ?? [],
    priority: input.priority ?? null,
    reason: input.reason ?? null,
    metadata: input.metadata ?? {},
  };
}
