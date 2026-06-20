import type { RedisClientType } from "redis";

import type { ActiveCallSession, RealtimeConnectionState } from "../../domain/realtime-state.js";

const ACTIVE_CALL_TTL_SECONDS = 60 * 60 * 6;
const CONNECTION_TTL_SECONDS = 60 * 30;

export class ActiveCallStateService {
  constructor(private readonly redis: RedisClientType) {}

  async upsertActiveCall(input: ActiveCallSession): Promise<void> {
    const key = activeCallKey(input.callSessionId);
    await this.redis.hSet(key, serializeHash(input));
    await this.redis.expire(key, ACTIVE_CALL_TTL_SECONDS);
    await this.redis.sAdd(activeCallsSetKey(input.organizationId), input.callSessionId);
  }

  async listActiveCalls(organizationId: string): Promise<ActiveCallSession[]> {
    const callSessionIds = await this.redis.sMembers(activeCallsSetKey(organizationId));
    const calls = await Promise.all(callSessionIds.map(async (callSessionId) => this.getActiveCall(callSessionId)));
    return calls.filter((call): call is ActiveCallSession => Boolean(call));
  }

  async getActiveCall(callSessionId: string): Promise<ActiveCallSession | null> {
    const values = await this.redis.hGetAll(activeCallKey(callSessionId));

    if (!Object.keys(values).length) {
      return null;
    }

    return {
      organizationId: values.organizationId ?? "",
      callSessionId: values.callSessionId ?? callSessionId,
      providerCallSid: nullable(values.providerCallSid),
      streamSid: nullable(values.streamSid),
      status: activeStatus(values.status),
      connectedAt: values.connectedAt ?? new Date().toISOString(),
      updatedAt: values.updatedAt ?? new Date().toISOString(),
      from: nullable(values.from),
      to: nullable(values.to),
    };
  }

  async removeActiveCall(organizationId: string, callSessionId: string): Promise<void> {
    await this.redis.del(activeCallKey(callSessionId));
    await this.redis.sRem(activeCallsSetKey(organizationId), callSessionId);
  }

  async upsertConnectionState(input: RealtimeConnectionState): Promise<void> {
    const key = connectionStateKey(input.connectionId);
    await this.redis.hSet(key, serializeHash(input));
    await this.redis.expire(key, CONNECTION_TTL_SECONDS);
  }
}

function activeCallKey(callSessionId: string): string {
  return `active_call_session:${callSessionId}`;
}

function activeCallsSetKey(organizationId: string): string {
  return `active_call_sessions:${organizationId}`;
}

function connectionStateKey(connectionId: string): string {
  return `realtime_connection_state:${connectionId}`;
}

function serializeHash(input: object): Record<string, string> {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, value === null || value === undefined ? "" : String(value)]),
  );
}

function nullable(value: string | undefined): string | null {
  return value ? value : null;
}

function activeStatus(value: string | undefined): ActiveCallSession["status"] {
  if (value === "CONNECTING" || value === "ACTIVE" || value === "ENDED" || value === "FAILED") {
    return value;
  }

  return "CONNECTING";
}
