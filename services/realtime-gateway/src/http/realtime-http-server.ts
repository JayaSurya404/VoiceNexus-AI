import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { WebSocketServer, type RawData } from "ws";

import { env } from "../config/env.js";
import type { createContainer } from "../container.js";
import type { RealtimeConversation } from "../domain/entities/realtime-conversation.js";
import { RealtimeError } from "../shared/errors.js";

type Container = ReturnType<typeof createContainer>;

export async function createRealtimeHttpServer(container: Container) {
  const server = createServer((request, response) => {
    void handleHttpRequest(container, request, response);
  });
  const twilioWebSocketServer = createTwilioWebSocketServer(container);
  await container.services.supervisorWebSocketService.start(server);

  server.on("upgrade", (request, socket, head) => {
    const url = request.url ? new URL(request.url, "http://localhost") : null;

    if (url?.pathname !== "/realtime/twilio") {
      return;
    }

    console.info("[twilio-ws] upgrade received", {
      path: url.pathname,
      hasToken: Boolean(url.searchParams.get("token")),
      tokenLength: url.searchParams.get("token")?.length ?? 0,
      userAgent: request.headers["user-agent"] ?? null,
    });
    twilioWebSocketServer.handleUpgrade(request, socket, head, (ws) => {
      twilioWebSocketServer.emit("connection", ws, request);
    });
  });

  return server;
}

function createTwilioWebSocketServer(container: Container): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (socket, request) => {
    void (async () => {
      let context: Awaited<ReturnType<typeof container.services.realtimeGatewayService.openConnection>> | null = null;

      try {
        const url = new URL(request.url ?? "", "http://localhost");
        const token = url.searchParams.get("token");
        console.info("[twilio-ws] connection accepted by ws server", {
          hasToken: Boolean(token),
          tokenLength: token?.length ?? 0,
        });

        if (!token) {
          throw RealtimeError.unauthorized("Twilio media stream token is required");
        }

        const claims = container.services.mediaStreamTokenService.verify(token);
        const queryOrganizationId = url.searchParams.get("organizationId");
        const queryCallSessionId = url.searchParams.get("callSessionId");

        if (queryOrganizationId && queryOrganizationId !== claims.organizationId) {
          throw RealtimeError.forbidden("Organization does not match signed media stream token");
        }

        if (queryCallSessionId && queryCallSessionId !== claims.callSessionId) {
          throw RealtimeError.forbidden("Call session does not match signed media stream token");
        }

        context = await container.services.realtimeGatewayService.openConnection(claims);
        console.info("[twilio-ws] authenticated", {
          organizationId: context.organizationId,
          callSessionId: context.callSessionId,
          providerCallSid: context.providerCallSid,
          connectionId: context.connectionId,
        });
        container.services.audioPlaybackService.register(context.callSessionId, {
          streamSid: null,
          send: (payload) => socket.readyState === socket.OPEN && socket.send(JSON.stringify(payload)),
        });

        socket.on("message", (message) => {
          void (async () => {
            try {
              const raw = rawMessageToString(message);
              logTwilioMessage(raw);
              registerStreamSid(container, context!.callSessionId, raw, (payload) =>
                socket.readyState === socket.OPEN && socket.send(JSON.stringify(payload)),
              );
              await container.services.realtimeGatewayService.handleMessage(context!, raw);
            } catch (error) {
              console.error("[twilio-ws] message handling failed", {
                callSessionId: context?.callSessionId ?? null,
                message: errorMessage(error),
              });
              socket.close(1008, errorMessage(error));
            }
          })();
        });
        socket.on("close", () => {
          console.info("[twilio-ws] socket closed", {
            callSessionId: context?.callSessionId ?? null,
            connectionId: context?.connectionId ?? null,
          });
          if (context) {
            container.services.audioPlaybackService.unregister(context.callSessionId);
            void container.services.realtimeGatewayService.closeConnection(context, "Socket closed");
          }
        });
      } catch (error) {
        console.error("[twilio-ws] connection rejected", {
          message: errorMessage(error),
        });
        socket.close(1008, errorMessage(error));
      }
    })();
  });

  return wss;
}

function logTwilioMessage(raw: string): void {
  try {
    const parsed = JSON.parse(raw) as {
      event?: string;
      streamSid?: string;
      sequenceNumber?: string;
      media?: { payload?: string; chunk?: string; timestamp?: string };
      start?: { callSid?: string; mediaFormat?: unknown; customParameters?: Record<string, string> };
    };
    console.info("[twilio-ws] message", {
      event: parsed.event ?? null,
      streamSid: parsed.streamSid ?? null,
      sequenceNumber: parsed.sequenceNumber ?? null,
      callSid: parsed.start?.callSid ?? null,
      mediaPayloadBytes: parsed.media?.payload ? Buffer.byteLength(parsed.media.payload, "base64") : null,
      mediaChunk: parsed.media?.chunk ?? null,
      mediaTimestamp: parsed.media?.timestamp ?? null,
      mediaFormat: parsed.start?.mediaFormat ?? null,
      customParameters: parsed.start?.customParameters ?? null,
    });
  } catch {
    console.warn("[twilio-ws] received non-json websocket message", {
      length: raw.length,
    });
  }
}

function registerStreamSid(
  container: Container,
  callSessionId: string,
  raw: string,
  send: (payload: Record<string, unknown>) => void,
): void {
  try {
    const parsed = JSON.parse(raw) as { event?: string; streamSid?: string };
    if (parsed.event === "start" && parsed.streamSid) {
      container.services.audioPlaybackService.register(callSessionId, { streamSid: parsed.streamSid, send });
    }
  } catch {
    // Validation happens in RealtimeGatewayService.
  }
}

async function handleHttpRequest(container: Container, request: IncomingMessage, response: ServerResponse) {
  applyCors(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, {
        data: {
          status: "ok",
          service: "voicenexus-realtime-gateway",
          uptime: process.uptime(),
        },
      });
      return;
    }

    const liveCallsMatch = /^\/organizations\/([^/]+)\/live-calls$/.exec(url.pathname);

    if (request.method === "GET" && liveCallsMatch?.[1]) {
      const organizationId = decodeURIComponent(liveCallsMatch[1]);
      const token = bearerToken(request);

      if (!token) {
        throw RealtimeError.unauthorized();
      }

      await container.services.accessTokenService.ensureOrganizationAccess(token, organizationId);
      const calls = await container.services.activeCallStateService.listActiveCalls(organizationId);
      sendJson(response, 200, { data: calls });
      return;
    }

    if (request.method === "GET" && url.pathname === "/voice-responses") {
      const organizationId = requiredQuery(url, "organizationId");
      const token = bearerToken(request);
      if (!token) throw RealtimeError.unauthorized();
      await container.services.accessTokenService.ensureOrganizationAccess(token, organizationId);
      const responses = await container.repositories.voiceResponses.listByOrganization(organizationId);
      sendJson(response, 200, { data: responses.map(toVoiceResponseDto) });
      return;
    }

    if (request.method === "GET" && url.pathname === "/realtime/conversations") {
      const organizationId = requiredQuery(url, "organizationId");
      const token = bearerToken(request);
      if (!token) throw RealtimeError.unauthorized();
      await container.services.accessTokenService.ensureOrganizationAccess(token, organizationId);
      const conversations = await container.services.realtimeConversationService.list(organizationId);
      sendJson(response, 200, { data: conversations.map(toRealtimeConversationDto) });
      return;
    }

    if (request.method === "GET" && url.pathname === "/realtime/metrics") {
      const organizationId = requiredQuery(url, "organizationId");
      const token = bearerToken(request);
      if (!token) throw RealtimeError.unauthorized();
      await container.services.accessTokenService.ensureOrganizationAccess(token, organizationId);
      sendJson(response, 200, { data: await container.services.latencyMetricsService.metrics(organizationId) });
      return;
    }

    const realtimeStateMatch = /^\/realtime\/conversations\/([^/]+)\/state$/.exec(url.pathname);
    if (request.method === "GET" && realtimeStateMatch?.[1]) {
      const conversation = await requireRealtimeConversation(container, request, realtimeStateMatch[1]);
      sendJson(response, 200, {
        data: {
          realtimeConversationId: conversation.id,
          organizationId: conversation.organizationId,
          callSessionId: conversation.callSessionId,
          status: conversation.status,
          speechState: conversation.speechState,
          currentTurnId: conversation.currentTurnId,
          activePlaybackSessionId: conversation.activePlaybackSessionId,
          takeoverActive: conversation.takeoverActive,
          takeoverBy: conversation.takeoverBy,
          updatedAt: conversation.updatedAt.toISOString(),
        },
      });
      return;
    }

    const realtimeTurnsMatch = /^\/realtime\/conversations\/([^/]+)\/turns$/.exec(url.pathname);
    if (request.method === "GET" && realtimeTurnsMatch?.[1]) {
      const conversation = await requireRealtimeConversation(container, request, realtimeTurnsMatch[1]);
      const turns = await container.services.turnManagerService.list(conversation.id);
      sendJson(response, 200, { data: turns.map(toTurnEventDto) });
      return;
    }

    const realtimePlaybackMatch = /^\/realtime\/conversations\/([^/]+)\/playback$/.exec(url.pathname);
    if (request.method === "GET" && realtimePlaybackMatch?.[1]) {
      const conversation = await requireRealtimeConversation(container, request, realtimePlaybackMatch[1]);
      const playbacks = await container.services.playbackSessionService.list(conversation.id);
      sendJson(response, 200, { data: playbacks.map(toPlaybackSessionDto) });
      return;
    }

    const realtimeBargeInsMatch = /^\/realtime\/conversations\/([^/]+)\/bargeins$/.exec(url.pathname);
    if (request.method === "GET" && realtimeBargeInsMatch?.[1]) {
      const conversation = await requireRealtimeConversation(container, request, realtimeBargeInsMatch[1]);
      const bargeIns = await container.services.bargeInService.list(conversation.id);
      sendJson(response, 200, { data: bargeIns.map(toBargeInEventDto) });
      return;
    }

    const realtimeTakeoverMatch = /^\/realtime\/conversations\/([^/]+)\/takeover$/.exec(url.pathname);
    if (request.method === "POST" && realtimeTakeoverMatch?.[1]) {
      const conversation = await requireRealtimeConversation(container, request, realtimeTakeoverMatch[1]);
      const body = await readJsonBody(request);
      const updated = await container.services.agentTakeoverService.requestTakeover(
        conversation,
        typeof body.userId === "string" ? body.userId : null,
      );
      sendJson(response, 200, { data: toRealtimeConversationDto(updated) });
      return;
    }

    const realtimeReleaseMatch = /^\/realtime\/conversations\/([^/]+)\/release$/.exec(url.pathname);
    if (request.method === "POST" && realtimeReleaseMatch?.[1]) {
      const conversation = await requireRealtimeConversation(container, request, realtimeReleaseMatch[1]);
      const updated = await container.services.agentTakeoverService.releaseTakeover(conversation);
      sendJson(response, 200, { data: toRealtimeConversationDto(updated) });
      return;
    }

    const realtimeConversationMatch = /^\/realtime\/conversations\/([^/]+)$/.exec(url.pathname);
    if (request.method === "GET" && realtimeConversationMatch?.[1]) {
      const conversation = await requireRealtimeConversation(container, request, realtimeConversationMatch[1]);
      sendJson(response, 200, { data: toRealtimeConversationDto(conversation) });
      return;
    }

    if (request.method === "GET" && url.pathname === "/voice-responses/metrics") {
      const organizationId = requiredQuery(url, "organizationId");
      const token = bearerToken(request);
      if (!token) throw RealtimeError.unauthorized();
      await container.services.accessTokenService.ensureOrganizationAccess(token, organizationId);
      sendJson(response, 200, { data: await container.repositories.voiceResponses.metrics(organizationId) });
      return;
    }

    const sessionResponsesMatch = /^\/voice-responses\/session\/([^/]+)$/.exec(url.pathname);
    if (request.method === "GET" && sessionResponsesMatch?.[1]) {
      const organizationId = requiredQuery(url, "organizationId");
      const token = bearerToken(request);
      if (!token) throw RealtimeError.unauthorized();
      await container.services.accessTokenService.ensureOrganizationAccess(token, organizationId);
      const responses = await container.repositories.voiceResponses.listBySession(organizationId, sessionResponsesMatch[1]);
      sendJson(response, 200, { data: responses.map(toVoiceResponseDto) });
      return;
    }

    const voiceResponseMatch = /^\/voice-responses\/([^/]+)$/.exec(url.pathname);
    if (request.method === "GET" && voiceResponseMatch?.[1]) {
      const token = bearerToken(request);
      if (!token) throw RealtimeError.unauthorized();
      const voiceResponse = await container.repositories.voiceResponses.findById(voiceResponseMatch[1]);
      if (!voiceResponse) throw RealtimeError.badRequest("NOT_FOUND", "Voice response was not found");
      await container.services.accessTokenService.ensureOrganizationAccess(token, voiceResponse.organizationId);
      sendJson(response, 200, { data: toVoiceResponseDto(voiceResponse) });
      return;
    }

    sendJson(response, 404, {
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    });
  } catch (error) {
    const statusCode = error instanceof RealtimeError ? error.statusCode : 500;
    sendJson(response, statusCode, {
      error: {
        code: error instanceof RealtimeError ? error.code : "INTERNAL_ERROR",
        message: errorMessage(error),
      },
    });
  }
}

function requiredQuery(url: URL, key: string): string {
  const value = url.searchParams.get(key);
  if (!value) throw RealtimeError.badRequest("VALIDATION_ERROR", `${key} is required`);
  return value;
}

function toVoiceResponseDto(value: {
  id: string;
  organizationId: string;
  sessionId: string | null;
  callId: string;
  leadId: string | null;
  responseText: string;
  provider: string;
  voice: string;
  audioUrl: string | null;
  durationMs: number;
  audioBytes: number;
  status: string;
  latencyMs: number | null;
  playbackStartedAt: Date | null;
  playbackCompletedAt: Date | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...value,
    playbackStartedAt: value.playbackStartedAt?.toISOString() ?? null,
    playbackCompletedAt: value.playbackCompletedAt?.toISOString() ?? null,
    createdAt: value.createdAt.toISOString(),
    updatedAt: value.updatedAt.toISOString(),
  };
}

async function requireRealtimeConversation(
  container: Container,
  request: IncomingMessage,
  id: string,
): Promise<RealtimeConversation> {
  const token = bearerToken(request);
  if (!token) throw RealtimeError.unauthorized();
  const conversation = await container.services.realtimeConversationService.findById(id);
  if (!conversation) throw RealtimeError.badRequest("NOT_FOUND", "Realtime conversation was not found");
  await container.services.accessTokenService.ensureOrganizationAccess(token, conversation.organizationId);
  return conversation;
}

function toRealtimeConversationDto(value: NonNullable<Awaited<ReturnType<Container["services"]["realtimeConversationService"]["findById"]>>>) {
  return {
    ...value,
    startedAt: value.startedAt.toISOString(),
    endedAt: value.endedAt?.toISOString() ?? null,
    createdAt: value.createdAt.toISOString(),
    updatedAt: value.updatedAt.toISOString(),
  };
}

function toTurnEventDto(value: Awaited<ReturnType<Container["services"]["turnManagerService"]["list"]>>[number]) {
  return {
    ...value,
    occurredAt: value.occurredAt.toISOString(),
    createdAt: value.createdAt.toISOString(),
  };
}

function toPlaybackSessionDto(value: Awaited<ReturnType<Container["services"]["playbackSessionService"]["list"]>>[number]) {
  return {
    ...value,
    queuedAt: value.queuedAt.toISOString(),
    startedAt: value.startedAt?.toISOString() ?? null,
    completedAt: value.completedAt?.toISOString() ?? null,
    cancelledAt: value.cancelledAt?.toISOString() ?? null,
    createdAt: value.createdAt.toISOString(),
    updatedAt: value.updatedAt.toISOString(),
  };
}

function toBargeInEventDto(value: Awaited<ReturnType<Container["services"]["bargeInService"]["list"]>>[number]) {
  return {
    ...value,
    detectedAt: value.detectedAt.toISOString(),
    createdAt: value.createdAt.toISOString(),
  };
}

function applyCors(response: ServerResponse): void {
  response.setHeader("access-control-allow-origin", env.FRONTEND_URL);
  response.setHeader("access-control-allow-credentials", "true");
  response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-headers", "authorization,content-type");
}

function bearerToken(request: IncomingMessage): string | null {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(RealtimeError.badRequest("VALIDATION_ERROR", "Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(body) as unknown;
        resolve(parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {});
      } catch {
        reject(RealtimeError.badRequest("VALIDATION_ERROR", "Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Realtime gateway error";
}

function rawMessageToString(message: RawData): string {
  if (typeof message === "string") {
    return message;
  }

  if (Buffer.isBuffer(message)) {
    return message.toString("utf8");
  }

  if (Array.isArray(message)) {
    return Buffer.concat(message).toString("utf8");
  }

  return Buffer.from(message).toString("utf8");
}
