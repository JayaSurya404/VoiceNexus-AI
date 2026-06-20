import type { IncomingMessage, Server } from "node:http";

import { WebSocket, WebSocketServer } from "ws";

import type { RealtimeEventEnvelope } from "../ports/event-bus.js";
import type { RedisEventBus } from "../../infrastructure/redis/redis-event-bus.js";
import type { AccessTokenService } from "../../security/access-token-service.js";
import type { ActiveCallStateService } from "./active-call-state-service.js";
import { RealtimeError } from "../../shared/errors.js";

interface SupervisorClient {
  organizationId: string;
  socket: WebSocket;
}

export class SupervisorWebSocketService {
  private readonly clients = new Set<SupervisorClient>();

  constructor(
    private readonly activeCalls: ActiveCallStateService,
    private readonly accessTokens: AccessTokenService,
    private readonly eventBus: RedisEventBus,
  ) {}

  async start(server: Server): Promise<WebSocketServer> {
    const wss = new WebSocketServer({ noServer: true });
    await this.eventBus.subscribeToAll((event) => {
      this.broadcast(event);
    });

    wss.on("connection", (socket, request) => {
      void this.handleConnection(socket, request);
    });

    server.on("upgrade", (request, socket, head) => {
      const url = request.url ? new URL(request.url, "http://localhost") : null;

      if (!url?.pathname.startsWith("/ws/organizations/") || !url.pathname.endsWith("/live-calls")) {
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    });

    return wss;
  }

  private async handleConnection(socket: WebSocket, request: IncomingMessage): Promise<void> {
    try {
      const url = new URL(request.url ?? "", "http://localhost");
      const organizationId = organizationIdFromPath(url.pathname);
      const token = url.searchParams.get("token");

      if (!organizationId || !token) {
        throw RealtimeError.unauthorized("Supervisor socket requires organization and access token");
      }

      await this.accessTokens.ensureOrganizationAccess(token, organizationId);
      const client: SupervisorClient = { organizationId, socket };
      this.clients.add(client);

      socket.send(
        JSON.stringify({
          type: "SNAPSHOT",
          organizationId,
          calls: await this.activeCalls.listActiveCalls(organizationId),
        }),
      );
      socket.on("close", () => this.clients.delete(client));
    } catch (error) {
      socket.close(error instanceof RealtimeError ? 1008 : 1011, errorMessage(error));
    }
  }

  private broadcast(event: RealtimeEventEnvelope): void {
    const message = JSON.stringify({
      type: "EVENT",
      event,
    });

    for (const client of this.clients) {
      if (client.organizationId === event.organizationId && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(message);
      }
    }
  }
}

function organizationIdFromPath(pathname: string): string | null {
  const match = /^\/ws\/organizations\/([^/]+)\/live-calls$/.exec(pathname);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Supervisor socket failed";
}
