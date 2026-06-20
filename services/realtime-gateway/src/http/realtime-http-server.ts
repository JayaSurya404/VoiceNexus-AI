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

        socket.on("message", (message) => {
          void (async () => {
            try {
              await container.services.realtimeGatewayService.handleMessage(context!, rawMessageToString(message));
            } catch (error) {
              socket.close(1008, errorMessage(error));
            }
          })();
        });
        socket.on("close", () => {
          if (context) {
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
