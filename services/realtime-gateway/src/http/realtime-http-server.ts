import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { WebSocketServer, type RawData } from "ws";

import { env } from "../config/env.js";
import type { createContainer } from "../container.js";
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
        container.services.audioPlaybackService.register(context.callSessionId, {
          streamSid: null,
          send: (payload) => socket.readyState === socket.OPEN && socket.send(JSON.stringify(payload)),
        });

        socket.on("message", (message) => {
          void (async () => {
            try {
              const raw = rawMessageToString(message);
              registerStreamSid(container, context!.callSessionId, raw, (payload) =>
                socket.readyState === socket.OPEN && socket.send(JSON.stringify(payload)),
              );
              await container.services.realtimeGatewayService.handleMessage(context!, raw);
            } catch (error) {
              socket.close(1008, errorMessage(error));
            }
          })();
        });
        socket.on("close", () => {
          if (context) {
            container.services.audioPlaybackService.unregister(context.callSessionId);
            void container.services.realtimeGatewayService.closeConnection(context, "Socket closed");
          }
        });
      } catch (error) {
        socket.close(1008, errorMessage(error));
      }
    })();
  });

  return wss;
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

function applyCors(response: ServerResponse): void {
  response.setHeader("access-control-allow-origin", env.FRONTEND_URL);
  response.setHeader("access-control-allow-credentials", "true");
  response.setHeader("access-control-allow-methods", "GET,OPTIONS");
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
