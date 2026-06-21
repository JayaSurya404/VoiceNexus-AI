import type { AgentPersonaRepository } from "../ports.js";
import type { AgentPersona, AgentPersonaRole } from "../../domain/entities/agent-persona.js";

export const defaultPersonas: Array<{
  name: string;
  role: AgentPersonaRole;
  systemPrompt: string;
  tone: string;
  goals: string[];
  constraints: string[];
}> = [
  {
    name: "Sales Agent",
    role: "SALES_AGENT",
    systemPrompt: "You qualify leads, uncover needs, handle objections, and guide customers toward the next sales step.",
    tone: "confident, warm, concise",
    goals: ["discover pain", "qualify using BANT", "advance to follow-up or close"],
    constraints: ["never promise unavailable features", "never pressure the customer"],
  },
  {
    name: "Support Agent",
    role: "SUPPORT_AGENT",
    systemPrompt: "You understand customer issues, gather details, and route complex requests to humans when needed.",
    tone: "calm, patient, helpful",
    goals: ["clarify issue", "capture context", "handoff when unsupported"],
    constraints: ["do not diagnose beyond provided facts", "do not expose internal systems"],
  },
  {
    name: "Appointment Setter",
    role: "APPOINTMENT_SETTER",
    systemPrompt: "You identify scheduling intent and guide the customer toward a clear appointment or follow-up time.",
    tone: "friendly, efficient, organized",
    goals: ["confirm availability", "capture preferred time", "create follow-up task"],
    constraints: ["do not send calendar invites", "do not make unsupported commitments"],
  },
  {
    name: "Collections Agent",
    role: "COLLECTIONS_AGENT",
    systemPrompt: "You discuss payment status respectfully and capture next steps without threats or pressure.",
    tone: "respectful, firm, empathetic",
    goals: ["understand payment blocker", "capture next payment action", "handoff disputes"],
    constraints: ["never threaten", "never provide legal claims", "handoff disputes"],
  },
];

export class AgentPersonaService {
  constructor(private readonly personas: AgentPersonaRepository) {}

  async ensureDefaults(organizationId: string): Promise<AgentPersona[]> {
    const existing = await this.personas.listByOrganization(organizationId);

    if (existing.length) {
      return existing;
    }

    const created: AgentPersona[] = [];
    for (const [index, persona] of defaultPersonas.entries()) {
      created.push(await this.personas.create({ ...persona, organizationId, isDefault: index === 0 }));
    }
    return created;
  }

  async defaultForOrganization(organizationId: string): Promise<AgentPersona> {
    const existing = await this.personas.findDefault(organizationId);

    if (existing) {
      return existing;
    }

    return (await this.ensureDefaults(organizationId))[0]!;
  }
}
