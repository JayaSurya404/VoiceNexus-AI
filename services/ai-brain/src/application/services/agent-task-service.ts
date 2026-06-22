import type { AgentTaskRepository } from "../ports.js";
import type { AgentTask } from "../../domain/entities/agent-task.js";

export class AgentTaskService {
  constructor(private readonly tasks: AgentTaskRepository) {}

  create(input: Omit<AgentTask, "id" | "createdAt" | "updatedAt">): Promise<AgentTask> {
    return this.tasks.create(input);
  }

  list(organizationId: string): Promise<AgentTask[]> {
    return this.tasks.listByOrganization(organizationId);
  }

  async get(id: string, organizationId: string): Promise<AgentTask | null> {
    const task = await this.tasks.findById(id);
    return task?.organizationId === organizationId ? task : null;
  }

  complete(id: string, organizationId: string, output: Record<string, unknown>, confidence: number): Promise<AgentTask | null> {
    return this.tasks.update(id, organizationId, { status: "COMPLETED", output, confidence });
  }

  fail(id: string, organizationId: string, output: Record<string, unknown>, confidence: number): Promise<AgentTask | null> {
    return this.tasks.update(id, organizationId, { status: "FAILED", output, confidence });
  }
}
