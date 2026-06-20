import { ActiveCallStateService } from "./application/services/active-call-state-service.js";
import { RealtimeGatewayService } from "./application/services/realtime-gateway-service.js";
import { RealtimeTranscriptionService } from "./application/services/realtime-transcription-service.js";
import { SupervisorWebSocketService } from "./application/services/supervisor-websocket-service.js";
import { TranscriptBufferService } from "./application/services/transcript-buffer-service.js";
import { TranscriptPersistenceService } from "./application/services/transcript-persistence-service.js";
import { env } from "./config/env.js";
import { MongoAiConversationSessionRepository } from "./infrastructure/database/mongoose/repositories/mongo-ai-conversation-session-repository.js";
import { MongoOrganizationMemberAccessRepository } from "./infrastructure/database/mongoose/repositories/mongo-organization-member-access-repository.js";
import { MongoRealtimeTranscriptEventRepository } from "./infrastructure/database/mongoose/repositories/mongo-realtime-transcript-event-repository.js";
import { DeepgramClient } from "./infrastructure/deepgram/deepgram-client.js";
import { DeepgramStreamManager } from "./infrastructure/deepgram/deepgram-stream-manager.js";
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
  const transcriptPersistenceService = new TranscriptPersistenceService(transcriptBufferService, transcripts, eventBus);
  const deepgramClient = new DeepgramClient(env.DEEPGRAM_API_KEY);
  const deepgramStreamManager = new DeepgramStreamManager(
    deepgramClient,
    transcriptPersistenceService,
    eventBus,
  );
  const realtimeTranscriptionService = new RealtimeTranscriptionService(deepgramStreamManager);
  const mediaStreamTokenService = new MediaStreamTokenService();
  const accessTokenService = new AccessTokenService(members);
  const realtimeGatewayService = new RealtimeGatewayService(
    activeCallStateService,
    conversations,
    eventBus,
    realtimeTranscriptionService,
  );
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
      transcriptPersistenceService,
      realtimeTranscriptionService,
      mediaStreamTokenService,
      accessTokenService,
      realtimeGatewayService,
      supervisorWebSocketService,
      eventBus,
    },
  };
}
