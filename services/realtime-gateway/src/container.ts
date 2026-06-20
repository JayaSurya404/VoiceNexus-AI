import { ActiveCallStateService } from "./application/services/active-call-state-service.js";
import { RealtimeGatewayService } from "./application/services/realtime-gateway-service.js";
import { SupervisorWebSocketService } from "./application/services/supervisor-websocket-service.js";
import { TranscriptBufferService } from "./application/services/transcript-buffer-service.js";
import { MongoAiConversationSessionRepository } from "./infrastructure/database/mongoose/repositories/mongo-ai-conversation-session-repository.js";
import { MongoOrganizationMemberAccessRepository } from "./infrastructure/database/mongoose/repositories/mongo-organization-member-access-repository.js";
import { MongoRealtimeTranscriptEventRepository } from "./infrastructure/database/mongoose/repositories/mongo-realtime-transcript-event-repository.js";
import { getRedisCommandClient } from "./infrastructure/redis/redis-client.js";
import { RedisEventBus } from "./infrastructure/redis/redis-event-bus.js";
import { AccessTokenService } from "./security/access-token-service.js";
import { MediaStreamTokenService } from "./security/media-stream-token-service.js";

export function createContainer() {
  const conversations = new MongoAiConversationSessionRepository();
  const transcripts = new MongoRealtimeTranscriptEventRepository();
  const members = new MongoOrganizationMemberAccessRepository();
  const redis = getRedisCommandClient();
  const eventBus = new RedisEventBus();
  const activeCallStateService = new ActiveCallStateService(redis);
  const transcriptBufferService = new TranscriptBufferService(redis, transcripts);
  const mediaStreamTokenService = new MediaStreamTokenService();
  const accessTokenService = new AccessTokenService(members);
  const realtimeGatewayService = new RealtimeGatewayService(activeCallStateService, conversations, eventBus);
  const supervisorWebSocketService = new SupervisorWebSocketService(
    activeCallStateService,
    accessTokenService,
    eventBus,
  );

  return {
    repositories: {
      conversations,
      transcripts,
      members,
    },
    services: {
      activeCallStateService,
      transcriptBufferService,
      mediaStreamTokenService,
      accessTokenService,
      realtimeGatewayService,
      supervisorWebSocketService,
      eventBus,
    },
  };
}
