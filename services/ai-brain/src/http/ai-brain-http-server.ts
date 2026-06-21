import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { z } from "zod";

import type { createContainer } from "../container.js";
import { env } from "../config/env.js";
import { AiBrainError } from "../shared/errors.js";
import {
  toAgentDecisionDto,
  toAgentPersonaDto,
  toAgentSessionDto,
  toConversationDto,
  toConversationStateDto,
  toMessageDto,
  toQualificationDto,
  toToolExecutionDto,
} from "./serializers.js";
import type { AgentDecision } from "../domain/entities/agent-decision.js";
import type { AgentSession } from "../domain/entities/agent-session.js";
import type { LeadQualification } from "../domain/entities/lead-qualification.js";

type Container = ReturnType<typeof createContainer>;

const personaInputSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["SALES_AGENT", "SUPPORT_AGENT", "APPOINTMENT_SETTER", "COLLECTIONS_AGENT"]),
  systemPrompt: z.string().min(1),
  tone: z.string().min(1),
  goals: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  isDefault: z.boolean().default(false),
});

export function createAiBrainHttpServer(container: Container) {
  return createServer((request, response) => {
    void handleRequest(container, request, response);
  });
}

async function handleRequest(container: Container, request: IncomingMessage, response: ServerResponse): Promise<void> {
  applyCors(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, { data: { status: "ok", service: "voicenexus-ai-brain", uptime: process.uptime() } });
      return;
    }

    const token = bearerToken(request);
    if (!token) throw AiBrainError.unauthorized();

    if (url.pathname === "/ai/personas" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      await container.services.personaService.ensureDefaults(organizationId);
      sendJson(response, 200, { data: (await container.repositories.personas.listByOrganization(organizationId)).map(toAgentPersonaDto) });
      return;
    }

    if (url.pathname === "/ai/personas" && request.method === "POST") {
      const input = personaInputSchema.parse(await readJson(request));
      await authorize(container, token, input.organizationId);
      sendJson(response, 201, { data: toAgentPersonaDto(await container.repositories.personas.create(input)) });
      return;
    }

    const personaMatch = /^\/ai\/personas\/([^/]+)$/.exec(url.pathname);
    if (personaMatch?.[1] && (request.method === "PUT" || request.method === "DELETE")) {
      const body = request.method === "PUT" ? await readJson(request) : {};
      const organizationId = request.method === "DELETE" ? requiredQuery(url, "organizationId") : String(body.organizationId ?? "");
      if (!organizationId) throw AiBrainError.validation("organizationId is required");
      await authorize(container, token, organizationId);

      if (request.method === "DELETE") {
        sendJson(response, 200, { data: { deleted: await container.repositories.personas.delete(personaMatch[1], organizationId) } });
        return;
      }

      const input = personaInputSchema.partial().extend({ organizationId: z.string().min(1) }).parse(body);
      const updated = await container.repositories.personas.update(personaMatch[1], organizationId, input);
      if (!updated) throw AiBrainError.notFound("Agent persona");
      sendJson(response, 200, { data: toAgentPersonaDto(updated) });
      return;
    }

    if (url.pathname === "/ai/sessions" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.sessions.listByOrganization(organizationId)).map(toAgentSessionDto) });
      return;
    }

    if (url.pathname === "/ai/runtime/metrics" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      const [sessions, qualifications, decisions] = await Promise.all([
        container.repositories.sessions.listByOrganization(organizationId),
        container.repositories.qualifications.listByOrganization(organizationId),
        container.repositories.decisions.listByOrganization(organizationId, 200),
      ]);
      const activeSessions = sessions.filter((session: AgentSession) => session.status === "ACTIVE").length;
      const completedSessions = sessions.filter((session: AgentSession) => session.status === "COMPLETED").length;
      const handoffDecisions = decisions.filter((decision: AgentDecision) => decision.type === "HANDOFF").length;
      const averageConfidence = sessions.length
        ? sessions.reduce((total: number, session: AgentSession) => total + session.confidence, 0) / sessions.length
        : 0;
      const hotLeads = qualifications.filter((qualification: LeadQualification) => qualification.interestLevel === "HOT").length;
      sendJson(response, 200, { data: { activeSessions, completedSessions, handoffDecisions, averageConfidence, hotLeads } });
      return;
    }

    const sessionStateMatch = /^\/ai\/sessions\/([^/]+)\/state$/.exec(url.pathname);
    if (sessionStateMatch?.[1] && request.method === "GET") {
      const session = await authorizedSession(container, token, sessionStateMatch[1]);
      const state = await container.repositories.states.findBySession(session.id);
      sendJson(response, 200, { data: state ? toConversationStateDto(state) : null });
      return;
    }

    const sessionDecisionsMatch = /^\/ai\/sessions\/([^/]+)\/decisions$/.exec(url.pathname);
    if (sessionDecisionsMatch?.[1] && request.method === "GET") {
      const session = await authorizedSession(container, token, sessionDecisionsMatch[1]);
      sendJson(response, 200, { data: (await container.repositories.decisions.listBySession(session.id)).map(toAgentDecisionDto) });
      return;
    }

    const sessionMatch = /^\/ai\/sessions\/([^/]+)$/.exec(url.pathname);
    if (sessionMatch?.[1] && request.method === "GET") {
      sendJson(response, 200, { data: toAgentSessionDto(await authorizedSession(container, token, sessionMatch[1])) });
      return;
    }

    if (url.pathname === "/ai/conversations" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.conversations.listByOrganization(organizationId)).map(toConversationDto) });
      return;
    }

    if (url.pathname === "/ai/qualifications" && request.method === "GET") {
      const organizationId = requiredQuery(url, "organizationId");
      await authorize(container, token, organizationId);
      sendJson(response, 200, { data: (await container.repositories.qualifications.listByOrganization(organizationId)).map(toQualificationDto) });
      return;
    }

    const conversationMessagesMatch = /^\/ai\/conversations\/([^/]+)\/messages$/.exec(url.pathname);
    if (conversationMessagesMatch?.[1] && request.method === "GET") {
      const conversation = await authorizedConversation(container, token, conversationMessagesMatch[1]);
      sendJson(response, 200, { data: (await container.repositories.messages.listByConversation(conversation.id)).map(toMessageDto) });
      return;
    }

    const conversationToolsMatch = /^\/ai\/conversations\/([^/]+)\/tools$/.exec(url.pathname);
    if (conversationToolsMatch?.[1] && request.method === "GET") {
      const conversation = await authorizedConversation(container, token, conversationToolsMatch[1]);
      sendJson(response, 200, { data: (await container.repositories.toolExecutions.listByConversation(conversation.id)).map(toToolExecutionDto) });
      return;
    }

    const conversationQualificationMatch = /^\/ai\/conversations\/([^/]+)\/qualification$/.exec(url.pathname);
    if (conversationQualificationMatch?.[1] && request.method === "GET") {
      const conversation = await authorizedConversation(container, token, conversationQualificationMatch[1]);
      const qualification = conversation.leadId ? await container.repositories.qualifications.findByLead(conversation.organizationId, conversation.leadId) : null;
      sendJson(response, 200, { data: qualification ? toQualificationDto(qualification) : null });
      return;
    }

    const conversationMatch = /^\/ai\/conversations\/([^/]+)$/.exec(url.pathname);
    if (conversationMatch?.[1] && request.method === "GET") {
      sendJson(response, 200, { data: toConversationDto(await authorizedConversation(container, token, conversationMatch[1])) });
      return;
    }

    throw AiBrainError.notFound("Route");
  } catch (error) {
    const statusCode = error instanceof AiBrainError ? error.statusCode : 500;
    sendJson(response, statusCode, {
      error: {
        code: error instanceof AiBrainError ? error.code : "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "AI Brain request failed",
      },
    });
  }
}

async function authorizedConversation(container: Container, token: string, conversationId: string) {
  const conversation = await container.repositories.conversations.findById(conversationId);
  if (!conversation) throw AiBrainError.notFound("AI conversation");
  await authorize(container, token, conversation.organizationId);
  return conversation;
}

async function authorizedSession(container: Container, token: string, sessionId: string) {
  const session = await container.repositories.sessions.findById(sessionId);
  if (!session) throw AiBrainError.notFound("Agent session");
  await authorize(container, token, session.organizationId);
  return session;
}

async function authorize(container: Container, token: string, organizationId: string): Promise<void> {
  await container.services.accessTokenService.ensureOrganizationAccess(token, organizationId);
}

function applyCors(response: ServerResponse): void {
  response.setHeader("access-control-allow-origin", env.FRONTEND_URL);
  response.setHeader("access-control-allow-credentials", "true");
  response.setHeader("access-control-allow-methods", "GET,POST,PUT,DELETE,OPTIONS");
  response.setHeader("access-control-allow-headers", "authorization,content-type");
}

function bearerToken(request: IncomingMessage): string | null {
  const authorization = request.headers.authorization;
  return authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : null;
}

function requiredQuery(url: URL, key: string): string {
  const value = url.searchParams.get(key);
  if (!value) throw AiBrainError.validation(`${key} is required`);
  return value;
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(payload));
}
